# Modelo de Privacidade e Compartilhamento de Dados

> Documento de design que resolve a Issue #11. Define o que é
> compartilhado, com quem, e sob quais condições, antes da implementação
> das features de rede social (Issues #9, #10, #13).
>
> Princípio geral: **privacy by default** — na dúvida, o dado é privado
> até que uma amizade aceita libere o acesso. Nada é público para
> desconhecidos nesta v1.

## 1. Níveis de acesso

Três níveis, sem variação por item nesta v1 (sem "público" nem
privacidade configurável por livro/nota — ver seção 7 para o motivo):

| Nível | Quem | Quando se aplica |
|---|---|---|
| **Dono** | O próprio usuário, sempre autenticado como ele | Sempre pode ver e editar seus próprios dados |
| **Amigo** | Usuário com amizade **ativa** (pedido aceito e não desfeito) | Libera visualização de um subconjunto de dados do dono (seção 2) |
| **Privado** | Qualquer outra pessoa (não-amigo, anônimo) | Sem acesso — a API trata como 404, nunca como 403, para não confirmar a existência do recurso |

Não existe "amigo de amigo" nem visibilidade transitiva. Não existe
distinção entre "amigo público" e "amigo privado" nesta v1.

## 2. Matriz de dados

| Dado | Dono | Amigo | Não-amigo |
|---|---|---|---|
| Perfil (nome, avatar) | ✓ | ✓ | ✗ |
| Lista de amigos (quem são) | ✓ | ✗ | ✗ |
| Contagem de amigos | ✓ | ✓ | ✗ |
| Livros (título, autor, descrição, status) | ✓ | ✓ | ✗ |
| Notas do livro (resumos, ideias, citações) | ✓ | ✗ | ✗ |
| Curtidas em um livro | ✓ | ✓ | ✗ |
| Comentários em um livro | ✓ | ✓ | ✗ |
| Contador de clones recebidos por um livro | ✓ | ✓ | ✗ |
| Atividade (clonou X, comentou Y) | ✓ | ✓ | ✗ |

Decisões que fecham os `(?)` do rascunho original da issue:

- **Livros são visíveis para amigos, não para o público.** Não há modo
  "livro público" nesta v1 — right-sizing do escopo; pode virar uma
  configuração por livro em versão futura (seção 7).
- **Notas são sempre privadas**, mesmo entre amigos. É o espaço mais
  pessoal do app (resumos e ideias do próprio usuário) e nenhuma issue
  pede compartilhamento de notas — só de livros e das interações sociais
  em torno deles (curtida/comentário/clone).
- **Comentários e curtidas são visíveis só para amigos do dono do
  livro**, não para qualquer um que veja o comentário. Como só amigos
  veem o livro, isso já decorre da regra anterior, mas fica explícito
  porque comentários poderiam vazar em notificações ou buscas.
- **Lista de amigos não é visível para outros amigos.** Só o próprio
  dono vê sua lista completa. Evita expor o grafo social inteiro a
  partir de uma única amizade aceita.
- **Atividade (clonou, comentou) é visível só para amigos**, nunca
  pública, e só aparece linkada ao dono da ação — sem feed agregado
  cross-amigos nesta v1 (isso é responsabilidade da Issue #13).

## 3. Busca de usuários

- Busca **apenas por e-mail exato** (não fuzzy, não por nome, não
  listagem geral de usuários) — já estava definido na Issue #14, mas
  reafirmado aqui porque impacta privacidade: buscar por e-mail exato é
  a única forma de descobrir alguém, o que impede "explorar" a base de
  usuários.
- O resultado da busca retorna **nome + avatar** apenas — nunca
  confirma/nega a existência de uma conta para quem não tem permissão
  (evita harvest attack combinado com rate limit, ver Issue #14).

## 4. Controle de privacidade por item

**Não existe** nesta v1 (nem por livro, nem por nota individual, nem
por perfil). Motivo: reduz a superfície de decisão de design e de UI
para o MVP das features sociais. Fica registrado aqui como débito
técnico consciente para uma v2 (ver seção 7), não como esquecimento.

## 5. Dados quando a amizade é desfeita

- **Livros clonados sobrevivem** — já é requisito explícito da Issue
  #10 ("livro clonado não é excluído caso a amizade seja desfeita"). O
  clone vira um livro comum, dono do clone tem posse total.
- **Curtidas e comentários feitos por um ex-amigo permanecem** no
  livro, mas deixam de ser visíveis para ele (porque ele não vê mais o
  livro — a visibilidade é derivada da amizade ativa no momento da
  leitura, não congelada no momento da interação).
- **Histórico de "havia sido amigo"** não é mantido como feature (sem
  "vocês foram amigos até tal data" na v1). O registro de auditoria
  interno (`friendships.deleted_at` — ver Issue #12) existe só para
  suportar a regra de "não permitir reenvio automático de pedido
  duplicado logo em seguida", não é exposto na UI.
- **Feed/atividade não é "limpo" retroativamente** — simplesmente para
  de ser consultável, pois a query de atividade sempre filtra por
  amizade ativa no momento da leitura.

## 6. Dados quando um usuário é deletado

- **Livros que ele criou**: permanecem no banco (não são deletados em
  cascata). Motivo: um livro pode ter sido clonado por terceiros, e
  clones não podem depender da existência do usuário original (Issue
  #10 exige que clones sobrevivam até ao fim de amizade, então também
  devem sobreviver à exclusão do criador original).
- **Clones feitos por ele**: permanecem — pertencem ao usuário que
  clonou, que continua existindo; se for o próprio deletado quem tinha
  clonado de outro, o clone dele também é preservado como um livro
  "órfão" comum.
- **Comentários**: o texto é mantido, mas a referência ao autor vira
  nula/anônima ("Usuário removido"). Preserva o contexto da conversa
  sem manter PII de quem saiu da plataforma.
- **Curtidas**: são removidas (não fazem sentido "anônimas" — apenas
  decrementam a contagem).
- **Pedidos de amizade pendentes envolvendo o usuário**: removidos.
- **Amizades ativas**: encerradas (mesmo efeito de "desfazer amizade"
  em massa) — os livros clonados pelo lado remanescente já sobreviveram
  pela regra da seção 5.
- **Perfil**: deixa de existir; qualquer link para o perfil do usuário
  deletado resolve para um estado "Usuário removido" em vez de 404, já
  que o contexto (ex: autor de um comentário antigo) ainda é relevante.

Esse comportamento é a base para as regras de cascade que a Issue #12
deve implementar (`ON DELETE SET NULL` em vez de `CASCADE` na maior
parte das FKs que apontam para `users`).

## 7. Fora de escopo desta v1 (débito técnico consciente)

Documentado para não ser reinventado no meio da implementação:

- Privacidade configurável por livro/nota individual.
- Perfil público (visível sem amizade).
- "Amigos de amigos".
- Feed agregado cross-amigos (atividade combinada de todos os amigos
  em uma timeline — Issue #13 cobre notificação individual, não feed).
- Auditoria/log de quem acessou o quê.

## 8. Impacto nas próximas issues

- **Issue #12 (schema)**: usar `ON DELETE SET NULL` para
  `related_user_id`/autor de comentário e para o dono de livros
  clonados quando a fonte é deletada; `ON DELETE CASCADE` apenas para
  dados que não têm sentido sem o dono direto (ex: pedidos de amizade
  pendentes, curtidas).
- **Issue #14 (permissões)**: a matriz de dados da seção 2 é a fonte de
  verdade para as regras de `authorize()` — a issue de permissões
  implementa o *como*, este documento define o *o quê*.
- **Issue #9 (amigos)**: a busca (seção 3) e a lista de amigos privada
  (seção 2) definem a UI de gerenciamento de amigos.
- **Issue #13 (notificações)**: notificações só podem revelar dados que
  o destinatário já tem permissão de ver (ex: notificar sobre
  comentário só se o destinatário ainda é amigo de quem comentou).
