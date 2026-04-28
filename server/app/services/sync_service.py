import time
import logging
from datetime import datetime
from sqlalchemy.orm import Session
from app.models.all_models import Movie
from app.services.tmdb import TMDBService

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class SyncService:
    @staticmethod
    def sync_category(db: Session, category: str, pages: int = 5) -> int:
        """
        Sync movies from a specific TMDB category.
        category: popular, top_rated, upcoming, now_playing
        """
        logger.info(f"Starting sync for category: {category}, pages: {pages}")
        
        endpoint_methods = {
            "popular": TMDBService.get_popular_movies,
            "top_rated": TMDBService.get_top_rated_movies,
            "upcoming": TMDBService.get_upcoming_movies,
            "now_playing": TMDBService.get_now_playing_movies
        }
        
        fetch_method = endpoint_methods.get(category)
        if not fetch_method:
            logger.error(f"Invalid category: {category}")
            return 0
            
        # Get genre mapping once per sync
        genre_map = TMDBService.get_genres()
        
        synced_count = 0
        for page in range(1, pages + 1):
            try:
                data = fetch_method(page=page)
                results = data.get("results", [])
                if not results:
                    break
                    
                for item in results:
                    SyncService._upsert_movie(db, item, category, genre_map)
                    synced_count += 1
                
                db.commit()
                logger.info(f"Synced page {page} for {category}")
                time.sleep(0.1) # Respect rate limits
            except Exception as e:
                logger.error(f"Error syncing {category} page {page}: {e}")
                db.rollback()
                
        return synced_count

    @staticmethod
    def _upsert_movie(db: Session, item: dict, status: str, genre_map: dict = None):
        # Parse release date
        rel_date = None
        if item.get("release_date"):
            try:
                rel_date = datetime.strptime(item["release_date"], "%Y-%m-%d")
            except ValueError:
                pass
        
        movie_id = item["id"]
        existing_movie = db.query(Movie).filter(Movie.id == movie_id).first()
        
        # If origin_country is missing in the list item (common in TMDB list endpoints),
        # we try to get it from details if it's a new movie or it's missing in DB
        origin_country = ",".join(item.get("origin_country", []))
        if not origin_country and (not existing_movie or not existing_movie.origin_country):
            try:
                details = TMDBService.get_movie_details(movie_id)
                if details and "production_countries" in details:
                    origin_country = ",".join([c["iso_3166_1"] for c in details["production_countries"]])
                elif details and "origin_country" in details:
                    origin_country = ",".join(details["origin_country"])
            except:
                pass

        # Handle genres
        genres_str = ""
        genre_ids = item.get("genre_ids", [])
        if genre_ids and genre_map:
            genres_str = ",".join([genre_map.get(gid, "") for gid in genre_ids if genre_map.get(gid)])
        elif existing_movie and hasattr(existing_movie, 'genres') and existing_movie.genres:
            genres_str = existing_movie.genres

        movie_data = {
            "title": item.get("title"),
            "overview": item.get("overview"),
            "poster_path": item.get("poster_path"),
            "backdrop_path": item.get("backdrop_path"),
            "release_date": rel_date,
            "popularity": item.get("popularity"),
            "vote_average": item.get("vote_average"),
            "vote_count": item.get("vote_count"),
            "status": status,
            "origin_country": origin_country,
            "original_language": item.get("original_language"),
            "genres": genres_str
        }
        
        if existing_movie:
            for key, value in movie_data.items():
                setattr(existing_movie, key, value)
        else:
            new_movie = Movie(id=movie_id, **movie_data)
            db.add(new_movie)

    @staticmethod
    def sync_all(db: Session, full_sync: bool = False):
        """
        Sync all major categories.
        full_sync: if True, sync more pages (e.g. 20), otherwise 3 pages.
        """
        pages = 20 if full_sync else 3
        categories = ["popular", "top_rated", "upcoming", "now_playing"]
        total = 0
        for cat in categories:
            total += SyncService.sync_category(db, cat, pages=pages)
        return total
