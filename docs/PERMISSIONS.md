# Matriz de Permissões e Autorização

> Resolve a Issue #14. Todas as regras aqui são consequência direta das
> decisões já tomadas em `PRIVACY_MODEL.md` (Issue #11) e usam as
> tabelas definidas em `docs/DATABASE_SCHEMA.md` (Issue #12). Este
> documento define o *o quê*; `src/lib/authorize.ts` implementa o
> *como*.
>
> Princípio geral (igual ao de `PRIVACY_MODEL.md`): **na dúvida, nega**.
> Toda função de autorização recusa acesso por padrão e só libera quando
> uma regra explícita permite.

## 1. Matriz de permissões

### Amigos

| Ação | Próprio usuário | Amigo | Não-amigo |
|---|---|---|---|
| Ver perfil (nome, avatar) | ✅ | ✅ | ❌ |
| Ver lista de amigos | ✅ | ❌ | ❌ |
| Enviar pedido de amizade | ✅ (para outro usuário) | ❌ (já são amigos) | ✅ |
| Cancelar pedido enviado | ✅ (se for o requester e status = pending) | ❌ | ❌ |
| Aceitar/recusar pedido recebido | ✅ (se for o recipient e status = pending) | ❌ | ❌ |
| Desfazer amizade | ✅ (se for user_id ou friend_id da linha) | ✅ (o outro lado também pode) | ❌ |

Decisões que fecham os `(?)` da issue original:

- **Perfil de não-amigo é privado** (não existe "perfil público"), como
  já definido em `PRIVACY_MODEL.md` §1.
- **Lista de amigos só o próprio dono vê** — nem amigos em comum
  enxergam a lista uns dos outros (`PRIVACY_MODEL.md` §2).

### Livros

| Ação | Dono | Amigo do dono | Não-amigo |
|---|---|---|---|
| Ver livro | ✅ | ✅ | ❌ |
| Editar livro | ✅ | ❌ | ❌ |
| Deletar livro | ✅ | ❌ | ❌ |
| Clonar livro | ❌ (não clona o próprio) | ✅ | ❌ |

- **Livros privados por item não existem** — visibilidade é sempre
  "dono ou amigo do dono" (`PRIVACY_MODEL.md` §4).
- **Dono não clona o próprio livro.** A matriz original da issue listava
  "✅ (pode clonar próprio)", mas isso não faz sentido prático (o dono já
  tem o livro) e complicaria a regra de unicidade de `book_clones.book_id`
  sem nenhum ganho — decisão explícita: `CLONE_BOOK` exige uma amizade
  ativa com o dono, nunca o próprio dono.

### Interações (curtidas e comentários)

| Ação | Autor da interação | Dono do livro | Amigo do dono | Não-amigo |
|---|---|---|---|---|
| Ver comentários/curtidas | ✅ | ✅ | ✅ | ❌ |
| Curtir livro | — | ✅ | ✅ | ❌ |
| Comentar livro | — | ✅ | ✅ | ❌ |
| Editar/deletar o próprio comentário | ✅ (se for o autor) | — | — | — |
| Deletar qualquer comentário no próprio livro (moderação) | — | ✅ | ❌ | ❌ |

- **Visibilidade de comentários/curtidas segue a do livro** — só quem
  pode ver o livro (dono ou amigo) vê as interações nele
  (`PRIVACY_MODEL.md` §2). Não existe comentário "mais privado" que o
  livro.
- **Apenas quem pode ver o livro pode curtir/comentar** — decorre
  diretamente da regra acima, não é uma permissão adicional separada.

## 2. Regras de acesso a dados (nível de API)

### Busca de usuários

```
authorize(actorId, "SEARCH_USER_BY_EMAIL")

✅ Sempre permitido para qualquer usuário autenticado.
Retorna nome + avatar. Nunca confirma/nega existência de conta para
quem não tem permissão de ver o perfil completo (harvest prevention,
já definido na Issue #11/#14 original).
```

### Perfil

```
authorize(actorId, "VIEW_PROFILE", { targetUserId })

actorId === targetUserId          → ✅
areFriends(actorId, targetUserId) → ✅
caso contrário                    → ❌
```

### Livro

```
authorize(actorId, "VIEW_BOOK" | "EDIT_BOOK" | "DELETE_BOOK" | "CLONE_BOOK" |
                    "LIKE_BOOK" | "COMMENT_BOOK", { bookId })

ownerId = dono do livro (via books.user_email → users.email)

VIEW_BOOK, LIKE_BOOK, COMMENT_BOOK:
  actorId === ownerId OU areFriends(actorId, ownerId) → ✅

EDIT_BOOK, DELETE_BOOK:
  actorId === ownerId → ✅ (só o dono, nunca amigo)

CLONE_BOOK:
  actorId !== ownerId E areFriends(actorId, ownerId) → ✅
```

## 3. Edge cases mapeados

| Cenário | Comportamento |
|---|---|
| Usuário tenta ver perfil/livro de alguém que não existe mais (deletado) | 404 — mesmo tratamento de "não encontrado", nunca 403 |
| Usuário tenta enviar pedido de amizade para si mesmo | Recusado (mesma checagem que `friend_requests.CHECK (requester_id <> recipient_id)` no banco, mas validado também na aplicação para dar uma mensagem clara) |
| Usuário A envia pedido, B também já tinha enviado pedido pendente para A | Recusado — `authorize()` checa as duas direções antes de permitir o insert (o `UNIQUE` do banco só cobre uma direção, ver `docs/DATABASE_SCHEMA.md` §6) |
| Amizade é desfeita enquanto há comentários/curtidas antigas do ex-amigo no livro | Comentários/curtidas permanecem no banco, mas deixam de aparecer para o ex-amigo (a visibilidade é sempre recalculada no momento da leitura, nunca congelada) |
| Usuário tenta clonar um livro que ele mesmo já clonou antes | Recusado — a aplicação verifica se já existe uma linha em `book_clones` com esse `cloned_by_user_id` + `cloned_from_book_id` antes de permitir novo clone (a unicidade do schema é em `book_id`, não nessa combinação, então esse é um check de aplicação, não de constraint) |
| Livro clonado é re-clonado por um amigo do clonador | Permitido — é a cadeia de clones prevista na Issue #10; `CLONE_BOOK` só olha quem é o dono atual do livro sendo clonado, não a origem da cadeia |

## 4. Implementação

`src/lib/authorize.ts` exporta:

- `class UnauthorizedError extends Error` — lançada quando a checagem
  falha; quem chama decide se converte em 404 (recomendado para não
  vazar a existência do recurso) ou numa mensagem de erro no formulário.
- `authorize(actorId, action, context)` — lança `UnauthorizedError` se
  não permitido; não retorna nada em caso de sucesso (padrão
  "throw on failure", como sugerido na issue original).
- Helpers exportados separadamente por já serem úteis fora do contexto
  de uma única ação (`areFriends`, `getBookOwnerId`) — para telas que
  precisam decidir se mostram um botão, sem precisar capturar uma
  exceção só para saber a resposta.

Nenhuma server action existente hoje precisa desses checks (não há
telas de amigos/livro compartilhado ainda — essa é a Issue #9). O
módulo fica pronto para ser importado quando as issues #9 e #10 forem
implementadas.

## 5. Visibilidade de UI

Regra geral: **não renderizar** controles para ações sem permissão
(não só desabilitar) — evita vazar pela DOM que uma ação existiria.
Ex.: botão "Clonar" não aparece para não-amigos; botão "Enviar pedido de
amizade" não aparece se já são amigos ou já existe pedido pendente em
qualquer direção. Isso é responsabilidade de cada tela ao consumir os
helpers de `authorize.ts` — não há componente genérico neste PR, porque
as telas em si ainda não existem (Issue #9/#15).
