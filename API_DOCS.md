# MoviePulse API 接口文档

## 基础 URL
`http://localhost:8000`

## 认证 (Auth)

### 1. 用户注册
- **接口**: `POST /auth/register`
- **请求体**:
  ```json
  {
    "username": "testuser",
    "email": "test@example.com",
    "password": "password123"
  }
  ```
- **响应**: 用户信息 (UserSchema)

### 2. 用户登录
- **接口**: `POST /auth/login`
- **请求体**: `FormData` (username, password)
- **响应**:
  ```json
  {
    "access_token": "...",
    "token_type": "bearer"
  }
  ```

## 电影 (Movies)

### 3. 获取热门电影
- **接口**: `GET /movies/popular`
- **参数**: `page` (int, 默认 1)

### 4. 搜索电影
- **接口**: `GET /movies/search`
- **参数**: `query` (str), `page` (int, 默认 1)

### 5. 获取电影详情
- **接口**: `GET /movies/{movie_id}`
- **响应**: 包含标题、简介、海报路径、评分、导演、演员等。

### 6. 电影评分
- **接口**: `POST /movies/{movie_id}/rate`
- **Header**: `Authorization: Bearer <token>`
- **请求体**: `{"rating": 4.5}`

### 7. 添加评论
- **接口**: `POST /movies/{movie_id}/comment`
- **Header**: `Authorization: Bearer <token>`
- **请求体**: `{"content": "Great movie!"}`

### 8. 获取电影评论
- **接口**: `GET /movies/{movie_id}/comments`

### 9. 切换想看清单 (Watchlist)
- **接口**: `POST /movies/{movie_id}/watchlist`
- **Header**: `Authorization: Bearer <token>`

## 推荐 (Recommendations)

### 10. 获取个性化推荐
- **接口**: `GET /recommendations`
- **Header**: `Authorization: Bearer <token>`
- **响应**: 推荐电影列表 (List[Movie])

---
**提示**: API 文档由 FastAPI 自动生成，可通过 `http://localhost:8000/docs` 访问 Swagger UI 交互式文档。
