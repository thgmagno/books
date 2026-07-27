# 📚 Book Notes App — Guia de Setup

## ✅ O que foi feito

Seu repositório está pronto com:

- ✅ Backend Express.js com APIs RESTful
- ✅ Frontend React + Vite + Tailwind CSS
- ✅ Banco de dados PostgreSQL configurado
- ✅ Design minimalista com paleta customizada
- ✅ Componentes: Dashboard, BookDetail, AddBook, Sidebar
- ✅ Navegação mobile-first com hamburger menu
- ✅ Scripts de migração e seed

## 🚀 Próximos passos

### 1. Criar repositório privado no GitHub

```bash
# Acesse github.com/new
# Nome: book-notes-app
# Privado: ✅ Sim
# Copie a URL do repositório (HTTPS ou SSH)
```

### 2. Conectar local ao GitHub

```bash
cd /home/claude/book-notes-app

# Adicione o repositório remoto
git remote add origin https://github.com/seu-usuario/book-notes-app.git
git branch -M main

# Faça o push inicial
git push -u origin main
```

### 3. Configurar no Railway

```
1. Acesse railway.app e faça login
2. Clique em "New Project" → "Deploy from GitHub repo"
3. Selecione seu repositório privado
4. Configure as variáveis de ambiente:
   - DATABASE_URL=... (Railway providencia quando adiciona Postgres)
   - NODE_ENV=production
   - PORT=3000
5. Railway detectará automaticamente o package.json
6. Adione um banco PostgreSQL:
   - New → Postgres
7. Deploy automático estará pronto!
```

## 📋 Variáveis de ambiente (Railway)

Quando você adicionar o serviço PostgreSQL no Railway, ele criará automaticamente:
- `DATABASE_URL` — URL de conexão do banco

Você pode adicionar manualmente:
- `NODE_ENV=production`
- `PORT=3000` (Railway pode sobrescrever)

## 🧪 Testando localmente antes do deploy

```bash
# Instale dependências
npm install

# Configure .env com um banco local
DATABASE_URL=postgresql://user:password@localhost:5432/book_notes_db

# Crie as tabelas
npm run db:migrate

# (Opcional) Popule com dados de exemplo
npm run db:seed

# Inicie em desenvolvimento
npm run dev

# Acesse http://localhost:5173 no navegador
```

## 📝 Próximas features (opcional)

Depois de ter o app rodando, você pode adicionar:

- 🔐 Autenticação de usuários
- 📊 Estatísticas de leitura (gráficos, livros por mês)
- 🏷️ Tags e categorias de livros
- 📤 Importar/exportar dados
- 🌙 Modo escuro
- 📱 PWA (Progressive Web App)
- 🔄 Sincronização em tempo real

## ⚠️ Importante

- **Nunca commita `.env`** — sempre use `.env.example`
- **Railway fornece banco PostgreSQL** — você pode usar o Hobby plan gratuitamente
- **Domínio Railway** — Você ganha um domínio automático tipo `seu-app-xxx.up.railway.app`

## 📞 Suporte

Se tiver dúvidas:
1. Consulte o README.md
2. Verifique os logs do Railway
3. Teste localmente antes de fazer deploy

Aproveite! 📖✨
