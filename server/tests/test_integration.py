import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.db.session import get_db, Base
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from datetime import datetime, timedelta
from app.models.all_models import Movie

# Setup test database
SQLALCHEMY_DATABASE_URL = "sqlite:///./test_integration.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db
client = TestClient(app)

@pytest.fixture(autouse=True)
def setup_db():
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()
    # Add mock data
    now = datetime.now()
    m1 = Movie(
        id=1, title="Latest Movie", release_date=now - timedelta(days=1), 
        vote_average=8.5, status="now_playing", popularity=100.0
    )
    m2 = Movie(
        id=2, title="Upcoming Movie", release_date=now + timedelta(days=10), 
        vote_average=0.0, status="upcoming", popularity=50.0
    )
    m3 = Movie(
        id=3, title="Top Rated Movie", release_date=now - timedelta(days=100), 
        vote_average=9.5, status="top_rated", popularity=200.0
    )
    db.add_all([m1, m2, m3])
    db.commit()
    yield
    Base.metadata.drop_all(bind=engine)

def test_get_now_playing():
    response = client.get("/movies/now-playing")
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 1
    assert data[0]["title"] == "Latest Movie"

def test_get_upcoming():
    response = client.get("/movies/upcoming")
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 1
    assert data[0]["title"] == "Upcoming Movie"

def test_get_top_rated():
    response = client.get("/movies/top-rated?threshold=9.0")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert data[0]["title"] == "Top Rated Movie"

def test_sync_endpoint():
    # This might take time as it calls real TMDB API
    # For CI/CD, you might want to mock TMDBService
    response = client.post("/movies/sync?full=false")
    assert response.status_code == 200
    assert response.json()["status"] == "success"
