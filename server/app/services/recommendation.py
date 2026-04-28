from sqlalchemy.orm import Session
from app.models.all_models import User, Watchlist, Movie
from app.services.tmdb import TMDBService
from typing import List, Dict, Any

class RecommendationService:
    @staticmethod
    def get_recommendations(user_id: int, db: Session) -> List[Dict[str, Any]]:
        # 1. Get user's watchlist movies
        user_watchlist = db.query(Watchlist).filter(Watchlist.user_id == user_id).all()
        if not user_watchlist:
            # If no watchlist, return popular movies
            return TMDBService.get_popular_movies().get("results", [])[:10]
        
        # 2. Get recommendations based on watchlist
        # We take the 3 most recently added movies to the watchlist
        watchlist_movie_ids = [w.movie_id for w in user_watchlist]
        recent_watchlist_ids = watchlist_movie_ids[-3:]
        
        results = []
        seen_ids = set(watchlist_movie_ids)
        
        for movie_id in recent_watchlist_ids:
            tmdb_recs = TMDBService.get_recommendations(movie_id).get("results", [])
            for movie in tmdb_recs:
                if movie['id'] not in seen_ids:
                    results.append(movie)
                    seen_ids.add(movie['id'])
                if len(results) >= 10:
                    break
            if len(results) >= 10:
                break
        
        # Fallback to popular if still empty
        if len(results) < 5:
            popular = TMDBService.get_popular_movies().get("results", [])
            for movie in popular:
                if movie['id'] not in seen_ids:
                    results.append(movie)
                    seen_ids.add(movie['id'])
                if len(results) >= 10:
                    break
        
        return results[:10]
