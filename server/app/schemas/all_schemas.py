from pydantic import BaseModel, EmailStr
from typing import List, Optional
from datetime import datetime

class UserBase(BaseModel):
    username: str
    email: EmailStr

class UserCreate(UserBase):
    password: str

class UserLogin(BaseModel):
    username: str
    password: str

class User(UserBase):
    id: int
    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None

class CommentBase(BaseModel):
    movie_id: int
    content: str

class CommentCreate(CommentBase):
    pass

class Comment(CommentBase):
    id: int
    user_id: int
    username: Optional[str] = None
    created_at: datetime
    class Config:
        from_attributes = True

class MovieDetail(BaseModel):
    id: int
    title: str
    overview: str
    poster_path: Optional[str]
    release_date: str
    genres: List[dict]
    runtime: Optional[int]
    cast: Optional[List[dict]]
    director: Optional[str]

class MovieSimple(BaseModel):
    id: int
    title: str
    overview: Optional[str] = None
    poster_path: Optional[str] = None
    backdrop_path: Optional[str] = None
    release_date: Optional[datetime] = None
    popularity: Optional[float] = None
    vote_average: Optional[float] = None
    vote_count: Optional[int] = None
    status: Optional[str] = None
    origin_country: Optional[str] = None
    original_language: Optional[str] = None
    genres: Optional[str] = None

    class Config:
        from_attributes = True

class SyncResult(BaseModel):
    status: str
    count: int
    message: str
