import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  const toggleSidebar = () => setIsOpen(!isOpen);

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={toggleSidebar}
        className="fixed top-4 left-4 z-50 md:hidden p-2 rounded-lg bg-primary text-white hover:bg-opacity-90"
        aria-label="Menu"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Overlay */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed md:relative md:translate-x-0 top-0 left-0 z-40
          w-64 h-screen bg-primary text-white
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          flex flex-col
        `}
      >
        {/* Header */}
        <div className="p-6 border-b border-white border-opacity-20">
          <h1 className="font-display text-2xl font-bold flex items-center gap-2">
            <span>📚</span>
            <span>Book Notes</span>
          </h1>
          <p className="text-sm text-white text-opacity-70 mt-1">Suas anotações de leitura</p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1">
          <Link
            to="/"
            onClick={() => setIsOpen(false)}
            className={`
              block px-4 py-3 rounded-lg transition-all
              ${isActive('/') 
                ? 'bg-secondary text-primary font-semibold' 
                : 'hover:bg-white hover:bg-opacity-10 text-white'
              }
            `}
          >
            📖 Biblioteca
          </Link>
          <Link
            to="/add"
            onClick={() => setIsOpen(false)}
            className={`
              block px-4 py-3 rounded-lg transition-all
              ${isActive('/add') 
                ? 'bg-secondary text-primary font-semibold' 
                : 'hover:bg-white hover:bg-opacity-10 text-white'
              }
            `}
          >
            ➕ Adicionar livro
          </Link>
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-white border-opacity-20 text-xs text-white text-opacity-60">
          <p>v1.0.0</p>
        </div>
      </aside>
    </>
  );
}
