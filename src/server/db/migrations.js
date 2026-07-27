import pool from './pool.js';

const migrations = `
  -- Books table
  CREATE TABLE IF NOT EXISTS books (
    id SERIAL PRIMARY KEY,
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

  -- Notes table
  CREATE TABLE IF NOT EXISTS notes (
    id SERIAL PRIMARY KEY,
    book_id INT NOT NULL REFERENCES books(id) ON DELETE CASCADE,
    note_type VARCHAR(50),
    content TEXT NOT NULL,
    page_number INT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
  );

  -- Book ratings
  CREATE TABLE IF NOT EXISTS book_ratings (
    id SERIAL PRIMARY KEY,
    book_id INT NOT NULL REFERENCES books(id) ON DELETE CASCADE,
    rating INT CHECK (rating >= 1 AND rating <= 5),
    review TEXT,
    created_at TIMESTAMP DEFAULT NOW()
  );

  -- Create indexes for better performance
  CREATE INDEX IF NOT EXISTS idx_books_status ON books(status);
  CREATE INDEX IF NOT EXISTS idx_notes_book_id ON notes(book_id);
  CREATE INDEX IF NOT EXISTS idx_ratings_book_id ON book_ratings(book_id);
`;

async function runMigrations() {
  try {
    console.log('Running migrations...');
    await pool.query(migrations);
    console.log('✅ Migrations completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration error:', error);
    process.exit(1);
  }
}

runMigrations();
