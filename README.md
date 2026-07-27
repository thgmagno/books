# 📚 Book Notes App

Um app pessoal para anotar livros, salvar resumos, ideias e citações. Ajuda a relembrar de livros já lidos e incentiva a leitura.

## 🎯 Funcionalidades

- **Biblioteca pessoal**: Organize livros por status (lendo, lido, quer ler)
- **Anotações estruturadas**: Salve resumos, ideias, citações e notas gerais
- **Visualização minimalista**: Design limpo inspirado em cadernos pessoais
- **Busca e filtros**: Encontre livros rapidamente por título, autor ou status
- **Estatísticas**: Acompanhe sua jornada de leitura

## 🛠️ Tech Stack

- **Backend**: Node.js + Express
- **Frontend**: React + Vite + Tailwind CSS
- **Banco de dados**: PostgreSQL
- **Deploy**: Railway

## 📋 Setup local

### Pré-requisitos
- Node.js 18+
- PostgreSQL 12+
- Git

### Instalação

```bash
# Clone o repositório
git clone <seu-repo-url>
cd book-notes-app

# Instale as dependências
npm install

# Configure as variáveis de ambiente
cp .env.example .env

# Configure seu banco de dados no .env
# DATABASE_URL=postgresql://user:password@localhost:5432/book_notes_db

# Crie as tabelas
npm run db:migrate

# (Opcional) Seed inicial com dados de exemplo
npm run db:seed

# Inicie o servidor de desenvolvimento
npm run dev
```

O app estará disponível em `http://localhost:5173` (frontend) e a API em `http://localhost:3000`.

## 📁 Estrutura do projeto

```
book-notes-app/
├── src/
│   ├── server/
│   │   ├── index.js
│   │   ├── routes/
│   │   │   ├── books.js
│   │   │   └── notes.js
│   │   ├── db/
│   │   │   ├── migrations.js
│   │   │   ├── seed.js
│   │   │   └── pool.js
│   │   └── middleware/
│   │       └── auth.js (preparado para autenticação futura)
│   ├── client/
│   │   ├── main.jsx
│   │   ├── App.jsx
│   │   ├── components/
│   │   │   ├── BookCard.jsx
│   │   │   ├── BookDetail.jsx
│   │   │   ├── NoteForm.jsx
│   │   │   └── Sidebar.jsx
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx
│   │   │   ├── BookDetail.jsx
│   │   │   └── AddBook.jsx
│   │   ├── styles/
│   │   │   ├── globals.css
│   │   │   └── tailwind.config.js
│   │   └── utils/
│   │       └── api.js
│   └── shared/
│       └── constants.js
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

## 🚀 Deploy no Railway

1. Crie um novo projeto no Railway
2. Conecte seu repositório GitHub
3. Configure as variáveis de ambiente (DATABASE_URL, NODE_ENV, etc)
4. Deploy automático

## 📝 API Endpoints

### Livros
- `GET /api/books` — Lista todos os livros
- `GET /api/books/:id` — Detalhes de um livro
- `POST /api/books` — Criar novo livro
- `PUT /api/books/:id` — Atualizar livro
- `DELETE /api/books/:id` — Deletar livro

### Notas
- `GET /api/books/:bookId/notes` — Notas de um livro
- `POST /api/books/:bookId/notes` — Adicionar nota
- `PUT /api/notes/:id` — Atualizar nota
- `DELETE /api/notes/:id` — Deletar nota

## 🎨 Design

Design minimalista inspirado em cadernos pessoais.

**Paleta**:
- Primária: `#2D3142` (azul-cinza profundo)
- Secundária: `#D4A574` (ocre quente)
- Fundo: `#FEFDFB` (creme suave)

**Tipografia**:
- Display: Merriweather (serif)
- Body: Inter (sans-serif)
- Mono: JetBrains Mono

## 📜 Licença

Privado

## ✍️ Autor

Desenvolvido por você 📖
