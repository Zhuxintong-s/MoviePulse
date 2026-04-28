from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.api.auth import get_current_user
from app.models.all_models import User
from app.services.recommendation import RecommendationService

router = APIRouter()

@router.get("/")
def get_user_recommendations(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return RecommendationService.get_recommendations(current_user.id, db)
