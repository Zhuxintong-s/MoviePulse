from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime, Text
from sqlalchemy.orm import relationship
from datetime import datetime
from app.db.session import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    
    comments = relationship("Comment", back_populates="user")
    watchlist = relationship("Watchlist", back_populates="user")

class Movie(Base):
    __tablename__ = "movies_cache"

    id = Column(Integer, primary_key=True, index=True) # TMDB ID
    title = Column(String, index=True)
    overview = Column(Text)
    poster_path = Column(String)
    backdrop_path = Column(String)
    release_date = Column(DateTime, index=True)
    popularity = Column(Float, index=True)
    vote_average = Column(Float, index=True, default=0.0) # 新增：评分
    vote_count = Column(Integer, default=0) # 新增：评分人数
    status = Column(String, index=True) # 'now_playing', 'upcoming', 'top_rated', etc.
    origin_country = Column(String) # 新增：存储国家代码，例如 "US,CN"
    original_language = Column(String, index=True) # 新增：原始语言
    genres = Column(String) # 新增：存储类型名称，逗号分隔，例如 "Action,Drama"
    last_updated = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class Comment(Base):
    __tablename__ = "comments"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    movie_id = Column(Integer, index=True)
    content = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="comments")

class Watchlist(Base):
    __tablename__ = "watchlist"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    movie_id = Column(Integer, index=True)
    added_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="watchlist")
