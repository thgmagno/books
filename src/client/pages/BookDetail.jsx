import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { booksAPI, notesAPI } from '../utils/api';
import { BOOK_STATUS_LABELS, NOTE_TYPE_LABELS } from '../../shared/constants';

export default function BookDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [book, setBook] = useState(null);
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('summary');
  const [newNote, setNewNote] = useState({ type: 'summary', content: '' });
  const [editingStatus, setEditingStatus] = useState(false);

  useEffect(() => {
    loadBook();
  }, [id]);

  const loadBook = async () => {
    try {
      setLoading(true);
      const response = await booksAPI.getById(id);
      setBook(response.data);
      setNotes(response.data.notes || []);
    } catch (error) {
      console.error('Error loading book:', error);
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!newNote.content.trim()) return;

    try {
      await notesAPI.create({
        book_id: id,
        note_type: newNote.type,
        content: newNote.content,
      });
      setNewNote({ type: 'summary', content: '' });
      loadBook();
    } catch (error) {
      console.error('Error creating note:', error);
    }
  };

  const handleDeleteNote = async (noteId) => {
    if (!confirm('Deletar esta anotação?')) return;
    try {
      await notesAPI.delete(noteId);
      loadBook();
    } catch (error) {
      console.error('Error deleting note:', error);
    }
  };

  const handleStatusChange = async (newStatus) => {
    try {
      await booksAPI.update(id, { status: newStatus });
      setEditingStatus(false);
      loadBook();
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const handleDeleteBook = async () => {
    if (!confirm('Deletar este livro e todas as anotações? Esta ação não pode ser desfeita.')) return;
    try {
      await booksAPI.delete(id);
      navigate('/');
    } catch (error) {
      console.error('Error deleting book:', error);
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center">
        <p className="text-accent">Carregando detalhes do livro...</p>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="p-8 text-center">
        <p className="text-accent">Livro não encontrado</p>
      </div>
    );
  }

  const filteredNotes = notes.filter((note) => {
    if (activeTab === 'all') return true;
    return note.note_type === activeTab;
  });

  const tabs = [
    { id: 'all', label: 'Todas' },
    { id: 'summary', label: 'Resumo' },
    { id: 'idea', label: 'Ideias' },
    { id: 'quote', label: 'Citações' },
    { id: 'general', label: 'Notas' },
  ];

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <button
        onClick={() => navigate('/')}
        className="mb-6 text-secondary hover:text-primary transition-colors font-semibold flex items-center gap-1"
      >
        ← Voltar
      </button>

      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
          <div className="flex flex-col md:flex-row gap-8">
            {/* Cover */}
            <div className="flex-shrink-0">
              <div className="w-32 h-48 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center text-5xl overflow-hidden">
                {book.cover_image_url ? (
                  <img src={book.cover_image_url} alt={book.title} className="w-full h-full object-cover" />
                ) : (
                  <span>📕</span>
                )}
              </div>
            </div>

            {/* Info */}
            <div className="flex-1">
              <h1 className="font-display text-3xl font-bold text-primary mb-2">{book.title}</h1>
              {book.author && (
                <p className="text-lg text-accent font-mono mb-4">{book.author}</p>
              )}

              {book.description && (
                <p className="text-text mb-6 leading-relaxed">{book.description}</p>
              )}

              {/* Status */}
              <div className="mb-6">
                {editingStatus ? (
                  <div className="flex gap-2 flex-wrap">
                    {Object.entries(BOOK_STATUS_LABELS).map(([key, label]) => (
                      <button
                        key={key}
                        onClick={() => handleStatusChange(key)}
                        className={`px-3 py-1 rounded text-sm font-semibold transition-all ${
                          book.status === key
                            ? 'bg-secondary text-primary'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-accent">Status:</span>
                    <button
                      onClick={() => setEditingStatus(true)}
                      className="px-4 py-2 bg-secondary text-primary rounded font-semibold hover:bg-opacity-90 transition-all"
                    >
                      {BOOK_STATUS_LABELS[book.status]}
                    </button>
                  </div>
                )}
              </div>

              {/* Dates */}
              <div className="flex gap-8 text-sm">
                {book.date_started && (
                  <div>
                    <p className="text-accent">Iniciado</p>
                    <p className="font-mono text-primary">{new Date(book.date_started).toLocaleDateString('pt-BR')}</p>
                  </div>
                )}
                {book.date_finished && (
                  <div>
                    <p className="text-accent">Finalizado</p>
                    <p className="font-mono text-primary">{new Date(book.date_finished).toLocaleDateString('pt-BR')}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Delete */}
            <div>
              <button
                onClick={handleDeleteBook}
                className="p-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="Deletar livro"
              >
                🗑️
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-lg font-semibold transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-primary text-white'
                  : 'bg-white text-primary border-2 border-primary border-opacity-20 hover:border-opacity-40'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Add Note Form */}
        <form onSubmit={handleAddNote} className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <label className="block mb-3">
            <span className="text-sm font-semibold text-primary mb-2 block">Tipo de anotação</span>
            <select
              value={newNote.type}
              onChange={(e) => setNewNote({ ...newNote, type: e.target.value })}
              className="w-full px-3 py-2 border-2 border-accent border-opacity-20 rounded-lg focus:border-secondary focus:outline-none"
            >
              <option value="summary">Resumo</option>
              <option value="idea">Ideia</option>
              <option value="quote">Citação</option>
              <option value="general">Nota</option>
            </select>
          </label>

          <textarea
            value={newNote.content}
            onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
            placeholder="Escreva sua anotação aqui..."
            className="w-full px-4 py-3 border-2 border-accent border-opacity-20 rounded-lg focus:border-secondary focus:outline-none resize-none mb-3"
            rows="4"
          />

          <button
            type="submit"
            className="w-full px-4 py-2 bg-secondary text-primary font-semibold rounded-lg hover:bg-opacity-90 transition-all"
          >
            Adicionar anotação
          </button>
        </form>

        {/* Notes List */}
        <div className="space-y-4">
          {filteredNotes.length === 0 ? (
            <div className="text-center py-8 bg-white rounded-lg">
              <p className="text-accent">Nenhuma anotação deste tipo</p>
            </div>
          ) : (
            filteredNotes.map((note) => (
              <div key={note.id} className="bg-white rounded-lg shadow-sm p-6 fade-in">
                <div className="flex justify-between items-start mb-3">
                  <span className="text-xs font-semibold text-secondary bg-secondary bg-opacity-10 px-2 py-1 rounded">
                    {NOTE_TYPE_LABELS[note.note_type]}
                  </span>
                  <button
                    onClick={() => handleDeleteNote(note.id)}
                    className="text-red-600 hover:bg-red-50 p-2 rounded transition-colors"
                    title="Deletar nota"
                  >
                    🗑️
                  </button>
                </div>
                <p className="text-text mb-3">{note.content}</p>
                <p className="text-xs text-accent font-mono">
                  {new Date(note.created_at).toLocaleDateString('pt-BR')}
                  {note.page_number && ` • Página ${note.page_number}`}
                </p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
