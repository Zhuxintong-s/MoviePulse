import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import MovieDetail from './pages/MovieDetail';
import Recommendations from './pages/Recommendations';
import SearchResults from './pages/SearchResults';
import Login from './pages/Login';
import Register from './pages/Register';

const App = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      // In a real app, you would verify the token with the backend
      // and get the user's data.
      setUser({ username: 'User' }); 
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <Router>
      <div className="min-h-screen bg-white text-gray-900 font-sans selection:bg-rose-500/30">
        <Navbar user={user} onLogout={handleLogout} />
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/movie/:id" element={<MovieDetail user={user} />} />
            <Route path="/recommendations" element={<Recommendations user={user} />} />
            <Route path="/search" element={<SearchResults />} />
            <Route path="/login" element={<Login onLogin={setUser} />} />
            <Route path="/register" element={<Register onLogin={setUser} />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>
        
        <footer className="bg-gray-50 border-t border-gray-200 py-12 mt-20">
          <div className="max-w-7xl mx-auto px-4 text-center">
            <div className="text-2xl font-black text-rose-500 mb-4">MOVIE PULSE</div>
            <p className="text-gray-500 text-sm">© 2026 MoviePulse - Powered by TMDB API</p>
          </div>
        </footer>
      </div>
    </Router>
  );
};

export default App;
