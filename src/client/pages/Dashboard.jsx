import { useState, useEffect } from 'react';
import BookCard from '../components/BookCard';
import { booksAPI } from '../utils/api';
import { BOOK_STATUS_LABELS } from '../../shared/constants';

export default function Dashboard() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadBooks();
  }, []);

  const loadBooks = async () => {
    try {
      setLoading(true);
      const response = await booksAPI.getAll();
      setBooks(response.data);
      setError(null);
    } catch (err) {
      console.error('Error loading books:', err);
      setError('Erro ao carregar livros');
    } finally {
      setLoading(false);
    }
  };

  const filteredBooks = books.filter((book) => {
    const matchesStatus = !selectedStatus || book.status === selectedStatus;
    const matchesSearch = !search || 
      book.title.toLowerCase().includes(search.toLowerCase()) ||
      (book.author && book.author.toLowerCase().includes(search.toLowerCase()));
    return matchesStatus && matchesSearch;
  });

  const booksByStatus = {
    want_to_read: filteredBooks.filter((b) => b.status === 'want_to_read'),
    reading: filteredBooks.filter((b) => b.status === 'reading'),
    read: filteredBooks.filter((b) => b.status === 'read'),
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-display text-4xl font-bold text-primary mb-2">
          Minha Biblioteca
        </h1>
        <p className="text-accent text-lg">
          {books.length} {books.length === 1 ? 'livro' : 'livros'} registrado{books.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Search Bar */}
      <div className="mb-8">
        <input
          type="text"
          placeholder="Buscar por título ou autor..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full px-4 py-3 rounded-lg border-2 border-accent border-opacity-20 focus:border-secondary focus:outline-none text-text font-body"
        />
      </div>

      {error && (
        <div className="mb-8 p-4 bg-red-100 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center py-12">
          <p className="text-accent">Carregando seus livros...</p>
        </div>
      ) : books.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg p-8">
          <p className="text-accent mb-4 text-lg">Nenhum livro adicionado ainda</p>
          <p className="text-accent text-opacity-60">Comece a adicionar livros para organizar sua biblioteca</p>
        </div>
      ) : (
        <div className="space-y-12">
          {Object.entries(booksByStatus).map(([status, statusBooks]) => (
            statusBooks.length > 0 && (
              <section key={status}>
                <h2 className="font-display text-2xl font-bold text-primary mb-6">
                  {BOOK_STATUS_LABELS[status]}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {statusBooks.map((book) => (
                    <BookCard key={book.id} book={book} />
                  ))}
                </div>
              </section>
            )
          ))}
        </div>
      )}
    </div>
  );
}
