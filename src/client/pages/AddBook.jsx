import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { booksAPI } from '../utils/api';

export default function AddBook() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    description: '',
    status: 'want_to_read',
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!formData.title.trim()) {
      setError('Título é obrigatório');
      return;
    }

    try {
      setLoading(true);
      const response = await booksAPI.create(formData);
      navigate(`/books/${response.data.id}`);
    } catch (err) {
      console.error('Error creating book:', err);
      setError('Erro ao adicionar livro. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <button
        onClick={() => navigate('/')}
        className="mb-8 text-secondary hover:text-primary transition-colors font-semibold flex items-center gap-1"
      >
        ← Voltar
      </button>

      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm p-8">
          <h1 className="font-display text-3xl font-bold text-primary mb-2">Adicionar novo livro</h1>
          <p className="text-accent mb-8">Comece por aqui. Você pode adicionar mais detalhes depois.</p>

          {error && (
            <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div>
              <label className="block text-sm font-semibold text-primary mb-2">
                Título *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Ex: O Senhor dos Anéis"
                className="w-full px-4 py-3 border-2 border-accent border-opacity-20 rounded-lg focus:border-secondary focus:outline-none text-text"
              />
            </div>

            {/* Author */}
            <div>
              <label className="block text-sm font-semibold text-primary mb-2">
                Autor
              </label>
              <input
                type="text"
                name="author"
                value={formData.author}
                onChange={handleChange}
                placeholder="Ex: J.R.R. Tolkien"
                className="w-full px-4 py-3 border-2 border-accent border-opacity-20 rounded-lg focus:border-secondary focus:outline-none text-text"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-semibold text-primary mb-2">
                Descrição
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Resumo breve do livro (opcional)"
                rows="4"
                className="w-full px-4 py-3 border-2 border-accent border-opacity-20 rounded-lg focus:border-secondary focus:outline-none text-text resize-none"
              />
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-semibold text-primary mb-2">
                Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-4 py-3 border-2 border-accent border-opacity-20 rounded-lg focus:border-secondary focus:outline-none text-text"
              >
                <option value="want_to_read">Quer ler</option>
                <option value="reading">Lendo</option>
                <option value="read">Lido</option>
              </select>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full px-6 py-3 bg-secondary text-primary font-semibold rounded-lg hover:bg-opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Adicionando...' : 'Adicionar livro'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
