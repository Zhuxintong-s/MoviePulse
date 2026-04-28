import requests
import os
from dotenv import load_dotenv
from typing import List, Dict, Any
from urllib3.util import Retry
from requests.adapters import HTTPAdapter

load_dotenv()

BASE_URL = "https://api.themoviedb.org/3"

class TMDBService:
    @staticmethod
    def _get_session():
        session = requests.Session()
        retry = Retry(
            total=3,
            backoff_factor=1,
            status_forcelist=[429, 500, 502, 503, 504],
        )
        adapter = HTTPAdapter(max_retries=retry)
        session.mount("http://", adapter)
        session.mount("https://", adapter)
        
        # Proxy support
        proxy_url = os.getenv("HTTP_PROXY") or os.getenv("http_proxy")
        if proxy_url:
            session.proxies = {"http": proxy_url, "https": proxy_url}
        
        return session

    @staticmethod
    def get_api_key():
        return os.getenv("TMDB_API_KEY")

    @staticmethod
    def _fetch(endpoint: str, params: Dict[str, Any] = None) -> Dict[str, Any]:
        if params is None:
            params = {}
        params["api_key"] = TMDBService.get_api_key()
        url = f"{BASE_URL}/{endpoint}"
        
        try:
            session = TMDBService._get_session()
            response = session.get(url, params=params, timeout=10)
            if response.status_code == 200:
                return response.json()
            else:
                print(f"TMDB Error Status {response.status_code}: {response.text}")
                return {"results": []}
        except Exception as e:
            print(f"TMDB Request Exception: {str(e)}")
            return {"results": []}

    @staticmethod
    def get_movie_details(movie_id: int) -> Dict[str, Any]:
        data = TMDBService._fetch(f"movie/{movie_id}", {"append_to_response": "credits"})
        if data and "id" in data:
            # Extract director
            director = next((member['name'] for member in data.get('credits', {}).get('crew', []) if member['job'] == 'Director'), None)
            data['director'] = director
            data['cast'] = data.get('credits', {}).get('cast', [])[:10]
            return data
        return {}

    @staticmethod
    def search_movies(query: str, page: int = 1) -> Dict[str, Any]:
        return TMDBService._fetch("search/movie", {"query": query, "page": page})

    @staticmethod
    def get_popular_movies(page: int = 1) -> Dict[str, Any]:
        return TMDBService._fetch("movie/popular", {"page": page})

    @staticmethod
    def get_top_rated_movies(page: int = 1) -> Dict[str, Any]:
        return TMDBService._fetch("movie/top_rated", {"page": page})

    @staticmethod
    def get_now_playing_movies(page: int = 1) -> Dict[str, Any]:
        return TMDBService._fetch("movie/now_playing", {"page": page})

    @staticmethod
    def get_upcoming_movies(page: int = 1) -> Dict[str, Any]:
        return TMDBService._fetch("movie/upcoming", {"page": page})

    @staticmethod
    def get_genres() -> Dict[int, str]:
        data = TMDBService._fetch("genre/movie/list")
        if data and "genres" in data:
            return {g["id"]: g["name"] for g in data["genres"]}
        return {}

    @staticmethod
    def get_recommendations(movie_id: int) -> Dict[str, Any]:
        return TMDBService._fetch(f"movie/{movie_id}/recommendations")
