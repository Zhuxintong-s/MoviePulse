import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, User, LogOut, Menu, X } from 'lucide-react';

const Navbar = ({ user, onLogout }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
      setIsMenuOpen(false);
    }
  };

  return (
    <nav className="bg-white/95 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-8">
            <Link to="/" className="text-2xl font-black text-rose-500 tracking-tighter">
              MOVIE<span className="text-gray-900">PULSE</span>
            </Link>
            <div className="hidden md:flex items-center gap-6">
              <Link to="/" className="text-gray-600 hover:text-rose-500 transition-colors font-medium">Home</Link>
              <Link to="/recommendations" className="text-gray-600 hover:text-rose-500 transition-colors font-medium">For You</Link>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-4">
            <form onSubmit={handleSearch} className="relative">
              <input
                type="text"
                placeholder="Search movies..."
                className="bg-gray-100 text-sm rounded-full py-2 pl-4 pr-10 focus:outline-none focus:ring-2 focus:ring-rose-500 w-64 transition-all"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-rose-500">
                <Search size={18} />
              </button>
            </form>

            {user ? (
              <div className="flex items-center gap-4 ml-4 border-l border-gray-200 pl-4">
                <Link to="/profile" className="flex items-center gap-2 text-gray-600 hover:text-rose-500">
                  <User size={20} />
                  <span className="text-sm font-medium">{user.username}</span>
                </Link>
                <button onClick={onLogout} className="text-gray-400 hover:text-red-500 transition-colors">
                  <LogOut size={20} />
                </button>
              </div>
            ) : (
              <Link to="/login" className="bg-rose-500 hover:bg-rose-600 px-6 py-2 rounded-full text-sm font-bold text-white transition-all shadow-lg shadow-rose-500/20">
                Sign In
              </Link>
            )}
          </div>

          <div className="md:hidden">
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-gray-300">
              {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-gray-900 border-b border-gray-800 p-4 space-y-4">
          <form onSubmit={handleSearch} className="relative">
            <input
              type="text"
              placeholder="Search movies..."
              className="bg-gray-800 w-full rounded-lg py-2 pl-4 pr-10 focus:outline-none"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          </form>
          <div className="flex flex-col gap-4">
            <Link to="/" className="text-gray-300 py-2" onClick={() => setIsMenuOpen(false)}>Home</Link>
            <Link to="/recommendations" className="text-gray-300 py-2" onClick={() => setIsMenuOpen(false)}>Recommendations</Link>
            {user ? (
              <>
                <Link to="/profile" className="text-gray-300 py-2" onClick={() => setIsMenuOpen(false)}>Profile</Link>
                <button onClick={() => { onLogout(); setIsMenuOpen(false); }} className="text-red-400 text-left py-2">Logout</button>
              </>
            ) : (
              <Link to="/login" className="bg-rose-500 text-white text-center py-2 rounded-lg font-bold" onClick={() => setIsMenuOpen(false)}>Sign In / Register</Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
