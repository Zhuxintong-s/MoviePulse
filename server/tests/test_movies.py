import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.db.session import get_db
from tests.test_auth import override_get_db, engine, Base

app.dependency_overrides[get_db] = override_get_db
client = TestClient(app)

@pytest.fixture(autouse=True)
def setup_db():
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)

def get_auth_token():
    client.post("/auth/register", json={"username": "testuser", "email": "test@example.com", "password": "testpassword"})
    response = client.post("/auth/login", data={"username": "testuser", "password": "testpassword"})
    return response.json()["access_token"]

def test_add_comment():
    token = get_auth_token()
    response = client.post(
        "/movies/550/comment",
        json={"movie_id": 550, "content": "Great movie!"},
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 200
    assert response.json()["content"] == "Great movie!"
