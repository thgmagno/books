import express from 'express';
import pool from '../db/pool.js';

const router = express.Router();

// Get notes for a book
router.get('/book/:bookId', async (req, res) => {
  try {
    const { bookId } = req.params;
    const { type } = req.query;

    let query = 'SELECT * FROM notes WHERE book_id = $1';
    const params = [bookId];

    if (type) {
      query += ' AND note_type = $2';
      params.push(type);
    }

    query += ' ORDER BY created_at DESC';

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching notes:', error);
    res.status(500).json({ error: 'Failed to fetch notes' });
  }
});

// Create note
router.post('/', async (req, res) => {
  try {
    const { book_id, note_type, content, page_number } = req.body;

    if (!book_id || !content) {
      return res.status(400).json({ error: 'Book ID and content are required' });
    }

    const result = await pool.query(
      `INSERT INTO notes (book_id, note_type, content, page_number)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [book_id, note_type || 'general', content, page_number || null]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating note:', error);
    res.status(500).json({ error: 'Failed to create note' });
  }
});

// Update note
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { note_type, content, page_number } = req.body;

    const result = await pool.query(
      `UPDATE notes 
       SET note_type = COALESCE($2, note_type),
           content = COALESCE($3, content),
           page_number = COALESCE($4, page_number),
           updated_at = NOW()
       WHERE id = $1
       RETURNING *`,
      [id, note_type, content, page_number]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Note not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating note:', error);
    res.status(500).json({ error: 'Failed to update note' });
  }
});

// Delete note
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query('DELETE FROM notes WHERE id = $1 RETURNING *', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Note not found' });
    }

    res.json({ message: 'Note deleted successfully', note: result.rows[0] });
  } catch (error) {
    console.error('Error deleting note:', error);
    res.status(500).json({ error: 'Failed to delete note' });
  }
});

export default router;
