import express from 'express';
import pool from '../db/pool.js';

const router = express.Router();

// Get all books with optional filtering
router.get('/', async (req, res) => {
  try {
    const { status, search } = req.query;
    let query = 'SELECT * FROM books';
    const params = [];

    if (status) {
      query += ' WHERE status = $1';
      params.push(status);
    }

    if (search) {
      const searchParam = `%${search}%`;
      if (params.length > 0) {
        query += ` AND (title ILIKE $2 OR author ILIKE $2)`;
      } else {
        query += ` WHERE (title ILIKE $1 OR author ILIKE $1)`;
      }
      params.push(searchParam);
    }

    query += ' ORDER BY updated_at DESC';

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching books:', error);
    res.status(500).json({ error: 'Failed to fetch books' });
  }
});

// Get book by ID with its notes
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const bookResult = await pool.query('SELECT * FROM books WHERE id = $1', [id]);
    if (bookResult.rows.length === 0) {
      return res.status(404).json({ error: 'Book not found' });
    }

    const notesResult = await pool.query(
      'SELECT * FROM notes WHERE book_id = $1 ORDER BY created_at DESC',
      [id]
    );

    const ratingResult = await pool.query(
      'SELECT * FROM book_ratings WHERE book_id = $1',
      [id]
    );

    res.json({
      ...bookResult.rows[0],
      notes: notesResult.rows,
      rating: ratingResult.rows[0] || null,
    });
  } catch (error) {
    console.error('Error fetching book:', error);
    res.status(500).json({ error: 'Failed to fetch book' });
  }
});

// Create new book
router.post('/', async (req, res) => {
  try {
    const { title, author, description, cover_image_url, status } = req.body;

    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }

    const result = await pool.query(
      `INSERT INTO books (title, author, description, cover_image_url, status)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [title, author || null, description || null, cover_image_url || null, status || 'want_to_read']
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating book:', error);
    res.status(500).json({ error: 'Failed to create book' });
  }
});

// Update book
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, author, description, cover_image_url, status, date_started, date_finished } = req.body;

    const result = await pool.query(
      `UPDATE books 
       SET title = COALESCE($2, title),
           author = COALESCE($3, author),
           description = COALESCE($4, description),
           cover_image_url = COALESCE($5, cover_image_url),
           status = COALESCE($6, status),
           date_started = COALESCE($7, date_started),
           date_finished = COALESCE($8, date_finished),
           updated_at = NOW()
       WHERE id = $1
       RETURNING *`,
      [id, title, author, description, cover_image_url, status, date_started, date_finished]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Book not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating book:', error);
    res.status(500).json({ error: 'Failed to update book' });
  }
});

// Delete book
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query('DELETE FROM books WHERE id = $1 RETURNING *', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Book not found' });
    }

    res.json({ message: 'Book deleted successfully', book: result.rows[0] });
  } catch (error) {
    console.error('Error deleting book:', error);
    res.status(500).json({ error: 'Failed to delete book' });
  }
});

export default router;
