import React, { useState, useEffect, useMemo, useRef } from 'react';
import { movieService } from '../services/api';
import MovieCard from '../components/MovieCard';
import FilterBar from '../components/FilterBar';
import { Loader2 } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const Home = () => {
  const [movies, setMovies] = useState([]);
  const [displayMovies, setSortedMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sorting, setSorting] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('popular'); // popular, now_playing, upcoming, top_rated
  
  // Persistence: Read from localStorage
  const [sortConfig, setSortConfig] = useState(() => {
    const saved = localStorage.getItem('movieSortConfig');
    return saved ? JSON.parse(saved) : { dimension: 'year', direction: 'desc', value: null };
  });

  const workerRef = useRef(null);

  useEffect(() => {
    // Initialize Web Worker
    workerRef.current = new Worker(new URL('../services/sortWorker.js', import.meta.url));
    workerRef.current.onmessage = (e) => {
      setSortedMovies(e.data);
      setSorting(false);
    };

    return () => {
      workerRef.current.terminate();
    };
  }, []);

  const fetchMovies = async (mode = 'popular') => {
    try {
      setLoading(true);
      let response;
      
      // If mode is a category, fetch that category. 
      // If it's a filter (letter/year/region), fetch 'popular' as the default base dataset
      const fetchMode = ['now_playing', 'upcoming', 'top_rated', 'popular'].includes(mode) ? mode : 'popular';
      
      switch (fetchMode) {
        case 'now_playing': response = await movieService.getNowPlaying(); break;
        case 'upcoming': response = await movieService.getUpcoming(); break;
        case 'top_rated': response = await movieService.getTopRated(); break;
        case 'popular': 
        default: response = await movieService.getPopular(); break;
      }
      
      let data = response.data;
      
      // If local cache is empty, trigger sync
      if (data.length === 0) {
        console.log('Cache empty, syncing with TMDB...');
        await movieService.sync();
        const retryRes = await movieService.getPopular();
        data = retryRes.data;
      }

      setMovies(data);
    } catch (err) {
      console.error('Error fetching movies:', err);
      setError('Failed to fetch movies. Please ensure your backend server is running.');
    } finally {
      setLoading(false);
    }
  };

  // Unified Handler for all sidebar clicks
  const handleSortChange = (dimension, direction, value = null) => {
    const newConfig = { dimension, direction, value };
    setSortConfig(newConfig);
    localStorage.setItem('movieSortConfig', JSON.stringify(newConfig));

    // Always fetch movies to reset the base dataset and ensure mutual exclusivity logic
    fetchMovies(dimension);
  };

  useEffect(() => {
    // Initial fetch based on saved config
    const initialMode = ['popular', 'now_playing', 'upcoming', 'top_rated'].includes(sortConfig.dimension) 
      ? sortConfig.dimension 
      : 'popular';
    fetchMovies(initialMode);
  }, []);

  // Debounced/Web Worker sorting
  useEffect(() => {
    if (movies.length > 0) {
      setSorting(true);
      // Immediately show unsorted movies if displayMovies is empty to avoid blank screen
      if (displayMovies.length === 0) {
        setSortedMovies(movies);
      }
      
      const timeoutId = setTimeout(() => {
        if (workerRef.current) {
          try {
            workerRef.current.postMessage({ movies, sortConfig });
          } catch (err) {
            console.error('Failed to post message to worker:', err);
            setSortedMovies(movies);
            setSorting(false);
          }
        } else {
          setSortedMovies(movies);
          setSorting(false);
        }
      }, 300); // 300ms debounce

      return () => clearTimeout(timeoutId);
    } else {
      setSortedMovies([]); // 如果没有电影，清空显示
    }
  }, [movies, sortConfig]);

  const genres = useMemo(() => [
    'Action', 'Adventure', 'Animation', 'Comedy', 'Crime', 
    'Documentary', 'Drama', 'Family', 'Fantasy', 'History', 
    'Horror', 'Music', 'Mystery', 'Romance', 'Science Fiction', 
    'TV Movie', 'Thriller', 'War', 'Western'
  ], []);
  const regions = useMemo(() => ['all', 'the United States', 'China', 'Japan', 'Korea', 'Britain', 'Europe'], []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="animate-spin text-rose-500" size={48} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-20 text-red-500 font-medium">
        <p className="text-xl">{error}</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Responsive Sidebar/Top Bar */}
        <FilterBar 
          currentSort={sortConfig} 
          onSortChange={handleSortChange}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          genres={genres}
          regions={regions}
        />

        <div className="flex-1">
          <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4">
            <h1 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3">
              {sorting && <Loader2 className="animate-spin text-rose-500" size={24} />}
              {displayMovies.length} Movies
            </h1>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {displayMovies.map(movie => (
              <MovieCard key={`${movie.id}-${movie.title}`} movie={movie} />
            ))}
          </div>

          {displayMovies.length === 0 && !sorting && (
            <div className="text-center py-20 text-gray-400 font-medium border-2 border-dashed border-gray-100 rounded-3xl">
              No movies found
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;
