-- Schema de banco de dados para as features sociais (Issue #12).
-- Fonte de verdade executável: scripts/migrate.mjs (roda via `npm run db:migrate`).
-- Este arquivo é uma cópia de referência versionada, mantida manualmente em
-- sincronia com scripts/migrate.mjs — não há framework de migrations neste
-- projeto, então é responsabilidade de quem editar um dos dois atualizar o
-- outro. Ver docs/DATABASE_SCHEMA.md para o diagrama ER e a justificativa
-- de cada decisão (cascades, soft delete, índices).

-- Tabelas existentes (scripts/migrate.mjs), reproduzidas aqui só para
-- contexto do diagrama — não fazem parte desta issue:
--
-- CREATE TABLE books (id SERIAL PRIMARY KEY, user_email VARCHAR(255) NOT NULL, ...)
-- CREATE TABLE notes (id SERIAL PRIMARY KEY, book_id INT REFERENCES books(id), ...)

CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255),
  image TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Contador denormalizado para exibir "N clones" na página do livro sem
-- precisar de um COUNT(*) em book_clones a cada carregamento.
ALTER TABLE books ADD COLUMN IF NOT EXISTS clone_count INT NOT NULL DEFAULT 0;

CREATE TABLE IF NOT EXISTS friend_requests (
  id SERIAL PRIMARY KEY,
  requester_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  recipient_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status VARCHAR(20) NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'accepted', 'rejected', 'cancelled')),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  responded_at TIMESTAMP,
  CHECK (requester_id <> recipient_id),
  UNIQUE (requester_id, recipient_id)
);

CREATE INDEX IF NOT EXISTS idx_friend_requests_recipient
  ON friend_requests(recipient_id, status);
CREATE INDEX IF NOT EXISTS idx_friend_requests_requester
  ON friend_requests(requester_id, status);

CREATE TABLE IF NOT EXISTS friendships (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  friend_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  friend_request_id INT REFERENCES friend_requests(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  deleted_at TIMESTAMP,
  CHECK (user_id <> friend_id),
  UNIQUE (user_id, friend_id)
);

CREATE INDEX IF NOT EXISTS idx_friendships_user ON friendships(user_id, deleted_at);
CREATE INDEX IF NOT EXISTS idx_friendships_friend ON friendships(friend_id, deleted_at);

CREATE TABLE IF NOT EXISTS book_clones (
  id SERIAL PRIMARY KEY,
  book_id INT NOT NULL UNIQUE REFERENCES books(id) ON DELETE CASCADE,
  cloned_from_book_id INT REFERENCES books(id) ON DELETE SET NULL,
  original_book_id INT REFERENCES books(id) ON DELETE SET NULL,
  cloned_by_user_id INT REFERENCES users(id) ON DELETE SET NULL,
  cloned_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_book_clones_from ON book_clones(cloned_from_book_id);
CREATE INDEX IF NOT EXISTS idx_book_clones_original ON book_clones(original_book_id);
CREATE INDEX IF NOT EXISTS idx_book_clones_user ON book_clones(cloned_by_user_id);

CREATE TABLE IF NOT EXISTS book_likes (
  id SERIAL PRIMARY KEY,
  book_id INT NOT NULL REFERENCES books(id) ON DELETE CASCADE,
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE (book_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_book_likes_book ON book_likes(book_id);
CREATE INDEX IF NOT EXISTS idx_book_likes_user ON book_likes(user_id);

CREATE TABLE IF NOT EXISTS book_comments (
  id SERIAL PRIMARY KEY,
  book_id INT NOT NULL REFERENCES books(id) ON DELETE CASCADE,
  user_id INT REFERENCES users(id) ON DELETE SET NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  deleted_at TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_book_comments_book ON book_comments(book_id, deleted_at);
CREATE INDEX IF NOT EXISTS idx_book_comments_user ON book_comments(user_id);

-- Notificações (Issue #13). "type" e "title" já vêm prontos do lado da
-- aplicação (ver src/lib/notifications.ts) — a UI nunca precisa
-- recalcular o texto a partir das FKs, então elas podem virar NULL sem
-- quebrar a notificação já registrada.
CREATE TABLE IF NOT EXISTS notifications (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  related_user_id INT REFERENCES users(id) ON DELETE SET NULL,
  related_book_id INT REFERENCES books(id) ON DELETE SET NULL,
  related_friend_request_id INT REFERENCES friend_requests(id) ON DELETE SET NULL,
  read_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON notifications(user_id, read_at);
CREATE INDEX IF NOT EXISTS idx_notifications_user_created ON notifications(user_id, created_at DESC);
