import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import BookDetailPage from './pages/BookDetail';
import AddBookPage from './pages/AddBook';
import './styles/globals.css';

export default function App() {
  return (
    <BrowserRouter>
      <div className="flex h-screen bg-background">
        <Sidebar />
        <main className="flex-1 overflow-auto">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/books/:id" element={<BookDetailPage />} />
            <Route path="/add" element={<AddBookPage />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
