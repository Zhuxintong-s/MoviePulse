import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.db.session import Base
from app.models.all_models import Movie
from app.services.sync_service import SyncService
import os

SQLALCHEMY_DATABASE_URL = "sqlite:///./test_sync.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def test_sync_movies_logic():
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()
    
    try:
        # Test syncing a small amount of data
        count = SyncService.sync_category(db, category="popular", pages=1)
        assert count > 0
        
        # Verify database content
        movie = db.query(Movie).first()
        assert movie is not None
        assert movie.title is not None
        assert movie.vote_average is not None
        assert movie.status == "popular"
        
    finally:
        db.close()
        Base.metadata.drop_all(bind=engine)
        if os.path.exists("./test_sync.db"):
            os.remove("./test_sync.db")

if __name__ == "__main__":
    test_sync_movies_logic()
    print("Sync logic test passed!")
