import { Pool } from "pg";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

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
`;

try {
  console.log("Running migrations...");
  await pool.query(sql);
  console.log("✅ Migrations completed");
  process.exit(0);
} catch (err) {
  console.error("❌ Migration error:", err);
  process.exit(1);
}
