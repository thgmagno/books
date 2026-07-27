# 📚 Book Notes App

App pessoal para anotar livros, salvar resumos, ideias e citações. Ajuda a relembrar livros já lidos e incentiva a leitura.

## 🛠️ Tech Stack

- **Next.js 16** — App Router + Server Actions
- **React 19** + **TypeScript**
- **shadcn/ui** + **Tailwind CSS v4**
- **NextAuth v5 (Auth.js)** — Google provider
- **PostgreSQL** (driver `pg`, SQL puro)
- **Deploy**: Vercel

## 🎯 Funcionalidades

- Login com conta Google (cada usuário vê apenas seus livros)
- Biblioteca por status: Quer ler / Lendo / Lido
- Anotações por tipo: Resumo, Ideia, Citação, Nota — organizadas em abas
- Busca por título/autor
- Datas de início/término preenchidas automaticamente ao mudar o status
- Design minimalista inspirado em cadernos pessoais

## 📋 Setup local

### Pré-requisitos
- Node.js 20+
- PostgreSQL 12+
- Credenciais OAuth do Google

### 1. Instalar e configurar

```bash
git clone <seu-repo-url>
cd book-notes-app
npm install
cp .env.example .env
```

### 2. Configurar Google OAuth

1. Acesse https://console.cloud.google.com → APIs & Services → Credentials
2. Crie um **OAuth 2.0 Client ID** (tipo: Web application)
3. Adicione a Redirect URI: `http://localhost:3000/api/auth/callback/google`
4. Copie o Client ID e Client Secret para o `.env`

### 3. Gerar o AUTH_SECRET

```bash
npx auth secret
```

### 4. Banco e execução

```bash
# Configure DATABASE_URL no .env, então:
npm run db:migrate

npm run dev
# http://localhost:3000
```

## 📁 Estrutura

```
src/
├── auth.ts                     # Config NextAuth v5 (Google)
├── app/
│   ├── layout.tsx              # Layout raiz (fontes, metadata)
│   ├── page.tsx                # Dashboard (protegido)
│   ├── login/page.tsx          # Login com Google
│   ├── books/
│   │   ├── new/page.tsx        # Adicionar livro
│   │   └── [id]/page.tsx       # Detalhes + abas de notas
│   ├── actions/
│   │   ├── auth.ts             # Server Actions: login/logout
│   │   ├── books.ts            # Server Actions: CRUD de livros
│   │   └── notes.ts            # Server Actions: CRUD de notas
│   └── api/auth/[...nextauth]/ # Route handler do NextAuth
├── components/
│   ├── ui/                     # Componentes shadcn/ui
│   ├── header.tsx, book-card.tsx, note-form.tsx,
│   ├── status-select.tsx, user-menu.tsx,
│   └── delete-*-button.tsx
└── lib/
    ├── db.ts                   # Pool PostgreSQL
    ├── types.ts                # Tipos e labels
    └── utils.ts                # cn() do shadcn
```
