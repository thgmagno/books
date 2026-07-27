import { Link } from 'react-router-dom';
import { BOOK_STATUS_LABELS } from '../../shared/constants';

export default function BookCard({ book }) {
  const getStatusColor = (status) => {
    const colors = {
      want_to_read: 'bg-gray-100 text-gray-700',
      reading: 'bg-amber-100 text-amber-700',
      read: 'bg-green-100 text-green-700',
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  const handlePageMarkerHover = (e) => {
    e.currentTarget.classList.add('page-marker-animate');
    setTimeout(() => {
      e.currentTarget.classList.remove('page-marker-animate');
    }, 400);
  };

  return (
    <Link to={`/books/${book.id}`}>
      <div className="fade-in group cursor-pointer">
        <div className="relative bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-4 h-full flex flex-col">
          {/* Page Marker */}
          <div
            onMouseEnter={handlePageMarkerHover}
            className="absolute -right-2 top-4 w-1 h-12 bg-gradient-to-b from-secondary to-accent rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
          />

          {/* Cover Image */}
          <div className="mb-3 h-32 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center text-4xl overflow-hidden">
            {book.cover_image_url ? (
              <img
                src={book.cover_image_url}
                alt={book.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <span>📕</span>
            )}
          </div>

          {/* Content */}
          <h3 className="font-display font-bold text-lg line-clamp-2 text-primary mb-1">
            {book.title}
          </h3>

          {book.author && (
            <p className="text-sm text-accent font-mono mb-3 line-clamp-1">
              {book.author}
            </p>
          )}

          {/* Status Badge */}
          <div className="mt-auto">
            <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${getStatusColor(book.status)}`}>
              {BOOK_STATUS_LABELS[book.status]}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
