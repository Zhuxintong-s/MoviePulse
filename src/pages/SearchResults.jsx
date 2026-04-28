import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { movieService } from '../services/api';
import MovieCard from '../components/MovieCard';
import { Loader2, Search } from 'lucide-react';

const SearchResults = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q');
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResults = async () => {
      if (!query) return;
      setLoading(true);
      try {
        const response = await movieService.search(query, 1);
        setMovies(response.data.results);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchResults();
  }, [query]);

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-indigo-500" size={48} /></div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 bg-white">
      <div className="flex items-center gap-4 mb-10">
        <Search className="text-rose-500" size={32} />
        <h1 className="text-4xl font-black text-gray-900 tracking-tight">Search Results for "{query}"</h1>
      </div>

      {movies.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-8">
          {movies.map(movie => (
            <MovieCard key={`${movie.id}-${movie.title}`} movie={movie} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 text-gray-500 font-medium border-2 border-dashed border-gray-200 rounded-3xl">
          <p className="text-xl mb-2">No movies found</p>
          <p className="text-sm text-gray-400">Try different keywords</p>
        </div>
      )}
    </div>
  );
};

export default SearchResults;
