import React from 'react';
import { Link } from 'react-router-dom';

const MovieCard = ({ movie }) => {
  const posterUrl = movie.poster_path 
    ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
    : 'https://via.placeholder.com/500x750?text=No+Poster';

  return (
    <Link to={`/movie/${movie.id}`} className="group relative bg-white rounded-lg overflow-hidden transition-transform hover:scale-105 duration-300 shadow-lg border border-gray-100">
      <img 
        src={posterUrl} 
        alt={movie.title} 
        className="w-full h-auto object-cover"
        loading="lazy"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-white/95 via-white/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
        <h3 className="text-lg font-bold text-gray-900 mb-1">{movie.title}</h3>
        <p className="text-xs text-gray-600 line-clamp-3">
          {movie.overview}
        </p>
      </div>
    </Link>
  );
};

export default MovieCard;
