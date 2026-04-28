import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { movieService } from '../services/api';
import { Clock, Calendar, User, MessageSquare, Loader2 } from 'lucide-react';

const MovieDetail = ({ user }) => {
  const { id } = useParams();
  const [movie, setMovie] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      
      setLoading(true);
      setError(null);
      
      try {
        const [movieRes, commentsRes] = await Promise.all([
          movieService.getDetails(id),
          movieService.getComments(id).catch(() => ({ data: [] })) // 允许评论加载失败但不影响主内容
        ]);
        
        if (!movieRes.data || !movieRes.data.title) {
          throw new Error('Movie data is incomplete');
        }
        
        setMovie(movieRes.data);
        setComments(commentsRes.data || []);
      } catch (err) {
        console.error('Failed to fetch movie details:', err);
        setError('Unable to load movie details. Please check your connection or try again later.');
        
        // 自动重试机制：3秒后自动重试
        if (retryCount < 3) {
          setTimeout(() => {
            setRetryCount(prev => prev + 1);
          }, 3000);
        }
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [id, retryCount]);

  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!user) return alert('Please login to comment');
    if (!newComment.trim()) return;

    setSubmitting(true);
    try {
      const response = await movieService.comment(id, newComment);
      setComments([response.data, ...comments]);
      setNewComment('');
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-40 gap-4">
      <Loader2 className="animate-spin text-rose-500" size={64} />
      <p className="text-gray-500 font-bold animate-pulse">Loading movie details...</p>
    </div>
  );

  if (error) return (
    <div className="flex flex-col items-center justify-center py-40 gap-6">
      <div className="bg-red-50 p-6 rounded-full">
        <MessageSquare className="text-red-500" size={48} />
      </div>
      <div className="text-center">
        <h2 className="text-2xl font-black text-gray-900 mb-2">Something went wrong</h2>
        <p className="text-gray-500 font-medium">{error}</p>
      </div>
      <button 
        onClick={handleRetry}
        className="bg-rose-500 hover:bg-rose-600 text-white px-8 py-3 rounded-xl font-bold transition-all shadow-lg shadow-rose-500/20 active:scale-95"
      >
        Try Again
      </button>
    </div>
  );

  if (!movie) return <div className="text-center py-40 font-bold text-gray-400">Movie not found</div>;

  const backdropUrl = movie.backdrop_path 
    ? `https://image.tmdb.org/t/p/original${movie.backdrop_path}`
    : 'https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&q=80&w=1600';
    
  const posterUrl = movie.poster_path 
    ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
    : 'https://via.placeholder.com/500x750?text=No+Poster';

  return (
    <div className="min-h-screen bg-white text-gray-900 pb-20">
      {/* Hero Section */}
      <div className="relative h-[50vh] md:h-[70vh] w-full overflow-hidden">
        <div className="absolute inset-0">
          <img 
            src={backdropUrl} 
            alt="" 
            className="w-full h-full object-cover transition-opacity duration-700" 
            onLoad={(e) => e.target.style.opacity = 1}
            style={{ opacity: 0 }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-white via-white/40 to-transparent" />
        </div>
        
        <div className="absolute bottom-0 left-0 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8 md:pb-16 flex flex-col md:flex-row gap-8 items-end">
          <div className="relative group hidden md:block">
            <img 
              src={posterUrl} 
              alt={movie.title} 
              className="w-56 lg:w-64 rounded-2xl shadow-2xl border-4 border-white transition-transform group-hover:scale-[1.02]" 
            />
          </div>
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-4xl md:text-7xl font-black mb-4 text-gray-900 drop-shadow-sm tracking-tighter leading-tight">
              {movie.title || 'Unknown Title'}
            </h1>
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 md:gap-8 text-gray-700 font-bold">
              {movie.release_date && (
                <div className="flex items-center gap-2 bg-white/80 backdrop-blur-md px-3 py-1 rounded-full shadow-sm">
                  <Calendar size={16} className="text-rose-500" /> {new Date(movie.release_date).getFullYear()}
                </div>
              )}
              {movie.runtime > 0 && (
                <div className="flex items-center gap-2 bg-white/80 backdrop-blur-md px-3 py-1 rounded-full shadow-sm">
                  <Clock size={16} className="text-rose-500" /> {movie.runtime} min
                </div>
              )}
              {movie.genres && movie.genres.length > 0 && (
                <div className="flex gap-2">
                  {movie.genres.slice(0, 3).map(g => (
                    <span key={g.id} className="bg-rose-50 text-rose-500 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider">
                      {g.name}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-1 lg:grid-cols-3 gap-16">
        <div className="lg:col-span-2 space-y-16">
          <section>
            <div className="flex items-center gap-3 mb-6">
              <div className="h-8 w-2 bg-rose-500 rounded-full" />
              <h2 className="text-3xl font-black text-gray-900 tracking-tight">Overview</h2>
            </div>
            <p className="text-gray-600 text-xl leading-relaxed font-medium">
              {movie.overview || 'No overview available.'}
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-black mb-6 flex items-center gap-3 text-gray-900">
              <MessageSquare className="text-rose-500" /> Comments ({comments.length})
            </h2>
            
            <form onSubmit={handleComment} className="mb-8">
              <textarea
                className="w-full bg-gray-50 border border-gray-200 rounded-2xl p-4 text-gray-900 focus:outline-none focus:ring-2 focus:ring-rose-500 transition-all placeholder:text-gray-400"
                rows="4"
                placeholder="What did you think about this movie?"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
              />
              <button
                type="submit"
                disabled={submitting}
                className="mt-4 bg-rose-500 hover:bg-rose-600 disabled:bg-gray-200 text-white px-8 py-3 rounded-xl font-bold transition-all shadow-lg shadow-rose-500/20"
              >
                {submitting ? 'Posting...' : 'Post Comment'}
              </button>
            </form>

            <div className="space-y-6">
              {comments.map((comment) => (
                <div key={comment.id} className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-rose-500 text-white rounded-full flex items-center justify-center font-bold">
                      {comment.username[0].toUpperCase()}
                    </div>
                    <div>
                      <div className="font-bold text-gray-900">{comment.username}</div>
                      <div className="text-xs text-gray-500">{new Date(comment.created_at).toLocaleDateString()}</div>
                    </div>
                  </div>
                  <p className="text-gray-700 leading-relaxed">{comment.content}</p>
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="space-y-8">
          <section className="bg-gray-50 p-8 rounded-3xl border border-gray-100 shadow-sm">
            <h2 className="text-xl font-black mb-6 text-gray-900">Cast</h2>
            <div className="space-y-4">
              {movie.cast?.map((person) => (
                <div key={person.id} className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gray-200 rounded-full overflow-hidden flex-shrink-0">
                    {person.profile_path ? (
                      <img src={`https://image.tmdb.org/t/p/w200${person.profile_path}`} alt="" className="w-full h-full object-cover" />
                    ) : <User className="w-full h-full p-2 text-gray-400" />}
                  </div>
                  <div>
                    <div className="font-bold text-sm text-gray-900">{person.name}</div>
                    <div className="text-xs text-gray-500">{person.character}</div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default MovieDetail;
