from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from app.db.session import get_db
from app.api.auth import get_current_user
from app.models.all_models import User, Comment, Watchlist, Movie
from app.schemas.all_schemas import MovieSimple, SyncResult, CommentCreate, Comment as CommentSchema
from app.services.tmdb import TMDBService
from app.services.sync_service import SyncService
from datetime import datetime

router = APIRouter()

@router.get("/popular", response_model=List[MovieSimple])
def get_popular(db: Session = Depends(get_db)):
    try:
        # Query from local cache
        movies = db.query(Movie).order_by(Movie.popularity.desc()).limit(200).all()
        return movies
    except Exception as e:
        print(f"Error in get_popular: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/now-playing", response_model=List[MovieSimple])
def get_now_playing(db: Session = Depends(get_db)):
    # Latest releases (ordered by release_date DESC, date <= today)
    return db.query(Movie).filter(Movie.release_date <= datetime.now()).order_by(Movie.release_date.desc()).limit(200).all()

@router.get("/upcoming", response_model=List[MovieSimple])
def get_upcoming(db: Session = Depends(get_db)):
    # Upcoming releases (ordered by release_date ASC, date > today)
    return db.query(Movie).filter(Movie.release_date > datetime.now()).order_by(Movie.release_date.asc()).limit(200).all()

@router.get("/top-rated", response_model=List[MovieSimple])
def get_top_rated(db: Session = Depends(get_db), threshold: float = 7.0):
    # Order by vote_average DESC, only above threshold
    return db.query(Movie).filter(Movie.vote_average >= threshold).order_by(Movie.vote_average.desc()).limit(200).all()

@router.post("/sync", response_model=SyncResult)
def sync_data(full: bool = False, db: Session = Depends(get_db)):
    # Sync all dimensions
    try:
        total = SyncService.sync_all(db, full_sync=full)
        return {"status": "success", "count": total, "message": f"Successfully synced {total} movies."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/search")
def search(query: str, page: int = 1):
    return TMDBService.search_movies(query, page)

@router.get("/{movie_id}")
def get_movie_details(movie_id: int):
    return TMDBService.get_movie_details(movie_id)

@router.post("/{movie_id}/comment", response_model=CommentSchema)
def add_comment(movie_id: int, comment_in: CommentCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    new_comment = Comment(user_id=current_user.id, movie_id=movie_id, content=comment_in.content)
    db.add(new_comment)
    db.commit()
    db.refresh(new_comment)
    # Add username to response
    res = CommentSchema.from_orm(new_comment)
    res.username = current_user.username
    return res

@router.get("/{movie_id}/comments", response_model=List[CommentSchema])
def get_comments(movie_id: int, db: Session = Depends(get_db)):
    comments = db.query(Comment).filter(Comment.movie_id == movie_id).all()
    res = []
    for c in comments:
        cs = CommentSchema.from_orm(c)
        cs.username = c.user.username
        res.append(cs)
    return res

@router.post("/{movie_id}/watchlist")
def toggle_watchlist(movie_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    item = db.query(Watchlist).filter(Watchlist.user_id == current_user.id, Watchlist.movie_id == movie_id).first()
    if item:
        db.delete(item)
        db.commit()
        return {"status": "removed"}
    
    new_item = Watchlist(user_id=current_user.id, movie_id=movie_id)
    db.add(new_item)
    db.commit()
    return {"status": "added"}
