# MoviePulse - 电影评分推荐系统

MoviePulse 是一个功能完整的电影评分与推荐网页应用。用户可以浏览热门电影、搜索影片、进行星级评分、发表评论，并获得基于个性化算法的电影推荐。

## 核心功能

- **用户系统**: 注册、登录、个人资料管理。
- **电影探索**: 实时获取 TMDB 热门电影、详细信息（海报、简介、演职员）。
- **交互系统**: 1-5 星级评分、想看清单（Watchlist）、用户评论。
- **推荐引擎**: 结合协同过滤（Collaborative Filtering）和基于内容的推荐（Content-based）。
- **响应式设计**: 完美适配桌面端和移动端。

## 技术栈

- **前端**: React 18, Tailwind CSS, Lucide React, Axios, React Router.
- **后端**: Python FastAPI, SQLAlchemy, SQLite, JWT Authentication.
- **数据源**: TMDB (The Movie Database) API.

## 快速开始

### 后端部署 (Server)

1. 进入 `server` 目录:
   ```bash
   cd server
   ```
2. 安装依赖:
   ```bash
   pip install -r requirements.txt
   ```
3. 配置环境变量:
   在 `server/.env` 中填写你的 `TMDB_API_KEY`。
4. 启动服务:
   ```bash
   uvicorn app.main:app --reload
   ```
   API 将运行在 `http://localhost:8000`。

### 前端部署 (Client)

1. 进入 `client` 目录:
   ```bash
   cd client
   ```
2. 安装依赖:
   ```bash
   npm install
   ```
3. 启动开发服务器:
   ```bash
   npm run dev
   ```
   访问 `http://localhost:5173`。

## 测试报告

- **单元测试**: 已完成核心业务逻辑（用户注册、登录、评分、评论）的单元测试。
- **运行测试**:
  ```bash
  cd server
  pytest
  ```

## 个性化推荐算法说明

本应用采用混合推荐策略：
1. **协同过滤**: 寻找与当前用户评分行为相似的其他用户，推荐他们喜欢但当前用户未看过的电影。
2. **基于内容 (Fallback)**: 当新用户评分数据不足时，根据用户最高评分电影的类型和特征，利用 TMDB 相似度算法生成推荐。

## 用户操作手册

1. **浏览**: 在首页查看当前热门电影。
2. **搜索**: 使用顶部搜索栏按片名寻找电影。
3. **评分/评论**: 点击电影卡片进入详情页，点击星星进行评分，在下方发表评论。
4. **推荐**: 登录后点击“Recommendations”查看专属你的电影列表。
