import React, { useState, useEffect } from 'react';
import { recommendationService } from '../services/api';
import MovieCard from '../components/MovieCard';
import { Sparkles, Loader2 } from 'lucide-react';

const Recommendations = ({ user }) => {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecs = async () => {
      if (!user) {
        setLoading(false);
        return;
      }
      try {
        const response = await recommendationService.getRecommendations();
        setMovies(response.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchRecs();
  }, [user]);

  if (!user) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <Sparkles size={64} className="mx-auto text-rose-500 mb-6 opacity-50" />
        <h1 className="text-3xl font-black mb-4 text-gray-900">Personalized Recommendations</h1>
        <p className="text-gray-600 mb-8 max-w-md mx-auto font-medium">
          Sign in to get personalized movie recommendations based on your unique taste and watchlist.
        </p>
        <button className="bg-rose-500 hover:bg-rose-600 text-white px-8 py-3 rounded-xl font-bold transition-all shadow-lg shadow-rose-500/20">
          Sign In Now
        </button>
      </div>
    );
  }

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-rose-500" size={48} /></div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex items-center gap-4 mb-10">
        <div className="p-3 bg-rose-50 rounded-2xl">
          <Sparkles className="text-rose-500" size={32} />
        </div>
        <div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tight">Just For You</h1>
          <p className="text-gray-500 font-medium">Based on your watchlist and interests</p>
        </div>
      </div>

      {movies.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-8">
          {movies.map(movie => (
            <MovieCard key={movie.id} movie={movie} />
          ))}
        </div>
      ) : (
        <div className="bg-gray-50 rounded-3xl p-12 text-center border border-dashed border-gray-200">
          <p className="text-xl text-gray-600 mb-4 font-bold">No recommendations yet!</p>
          <p className="text-gray-500">Add movies to your watchlist to help our algorithm understand your taste.</p>
        </div>
      )}
    </div>
  );
};

export default Recommendations;
