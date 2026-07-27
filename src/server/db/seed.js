import pool from './pool.js';

const seedData = `
  -- Insert sample books
  INSERT INTO books (title, author, description, status, date_finished, created_at)
  VALUES
    ('O Código da Vinci', 'Dan Brown', 'Um thriller envolvendo símbolos religiosos e mistério', 'read', '2024-01-15', NOW()),
    ('Sapiens', 'Yuval Noah Harari', 'História da humanidade desde o início até os dias atuais', 'reading', NULL, NOW()),
    ('1984', 'George Orwell', 'Distopia sobre um regime totalitário', 'want_to_read', NULL, NOW()),
    ('O Pequeno Príncipe', 'Antoine de Saint-Exupéry', 'Clássico infantil sobre um jovem príncipe em suas aventuras', 'read', '2023-06-20', NOW())
  ON CONFLICT DO NOTHING;

  -- Insert sample notes
  INSERT INTO notes (book_id, note_type, content, page_number, created_at)
  SELECT books.id, 'summary', 'Livro sobre a história da humanidade do Paleolítico até a era moderna, explorando revoluções cognitiva, agrícola e científica', 1, NOW()
  FROM books WHERE title = 'Sapiens'
  ON CONFLICT DO NOTHING;

  INSERT INTO notes (book_id, note_type, content, page_number, created_at)
  SELECT books.id, 'idea', 'Interessante considerar como a ficção coletiva (dinheiro, nações) moldou a civilização humana', 50, NOW()
  FROM books WHERE title = 'Sapiens'
  ON CONFLICT DO NOTHING;

  INSERT INTO notes (book_id, note_type, content, page_number, created_at)
  SELECT books.id, 'quote', '"A felicidade não vem de circunstâncias externas, mas de como percebemos a realidade"', 75, NOW()
  FROM books WHERE title = 'Sapiens'
  ON CONFLICT DO NOTHING;
`;

async function seed() {
  try {
    console.log('Seeding database...');
    await pool.query(seedData);
    console.log('✅ Seed completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed error:', error);
    process.exit(1);
  }
}

seed();
