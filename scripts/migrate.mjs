import { Pool } from "pg";
import { existsSync } from "fs";
import { resolve } from "path";
import { loadEnvFile } from "node:process";

// Em produção (Vercel) as variáveis de ambiente já vêm injetadas no
// processo, sem arquivo .env — só carrega o arquivo quando ele existe
// (uso local/dev).
const envPath = resolve(".env");
if (existsSync(envPath)) {
  loadEnvFile(envPath);
}

const sql = `
  CREATE TABLE IF NOT EXISTS books (
    id SERIAL PRIMARY KEY,
    user_email VARCHAR(255) NOT NULL,
    title VARCHAR(255) NOT NULL,
    author VARCHAR(255),
    description TEXT,
    cover_image_url TEXT,
    status VARCHAR(50) DEFAULT 'want_to_read',
    date_started DATE,
    date_finished DATE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
  );

  CREATE TABLE IF NOT EXISTS notes (
    id SERIAL PRIMARY KEY,
    book_id INT NOT NULL REFERENCES books(id) ON DELETE CASCADE,
    note_type VARCHAR(50) DEFAULT 'general',
    content TEXT NOT NULL,
    page_number INT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
  );

  CREATE INDEX IF NOT EXISTS idx_books_user ON books(user_email);
  CREATE INDEX IF NOT EXISTS idx_books_status ON books(status);
  CREATE INDEX IF NOT EXISTS idx_notes_book_id ON notes(book_id);

  -- Schema para as features sociais (Issue #12). Ver docs/schema.sql para
  -- o diagrama ER e a justificativa de cada decisão.

  CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255),
    image TEXT,
    created_at TIMESTAMP DEFAULT NOW()
  );

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
`;

try {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  console.log("Running migrations...");
  await pool.query(sql);
  console.log("✅ Migrations completed");
  process.exit(0);
} catch (err) {
  console.error("❌ Migration error:", err);
  process.exit(1);
}
