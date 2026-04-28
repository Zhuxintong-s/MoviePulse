import axios from 'axios';

const API_BASE_URL = 'http://localhost:8001';

const api = axios.create({
  baseURL: API_BASE_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authService = {
  login: (username, password) => {
    const formData = new FormData();
    formData.append('username', username);
    formData.append('password', password);
    return api.post('/auth/login', formData);
  },
  register: (username, email, password) => api.post('/auth/register', { username, email, password }),
};

const TMDB_KEY = '02afadbdb90557fc5f10b6d8660b1b49';

export const movieService = {
  // 优先从本地后端获取已同步的数据，如果为空则触发同步
  getPopular: (page) => api.get(`/movies/popular`),
  getNowPlaying: () => api.get(`/movies/now-playing`),
  getUpcoming: () => api.get(`/movies/upcoming`),
  getTopRated: () => api.get(`/movies/top-rated`),
  sync: () => api.post(`/movies/sync`),
  
  search: async (query, page) => {
    try {
      const res = await axios.get(`https://api.themoviedb.org/3/search/movie?api_key=${TMDB_KEY}&query=${encodeURIComponent(query)}&page=${page}`);
      return { data: res.data };
    } catch (err) {
      console.error("Direct TMDB search failed", err);
      return { data: { results: [] }};
    }
  },
  getDetails: async (id) => {
    try {
      const res = await axios.get(`https://api.themoviedb.org/3/movie/${id}?api_key=${TMDB_KEY}&append_to_response=credits`);
      const data = res.data;
      // 提取导演信息
      const director = data.credits?.crew?.find(member => member.job === 'Director')?.name;
      data.director = director;
      data.cast = data.credits?.cast?.slice(0, 10) || [];
      return { data };
    } catch (err) {
      console.error("Direct TMDB details fetch failed", err);
      throw err;
    }
  },
  comment: (id, content) => api.post(`/movies/${id}/comment`, { movie_id: id, content }),
  getComments: (id) => api.get(`/movies/${id}/comments`),
  toggleWatchlist: (id) => api.post(`/movies/${id}/watchlist`),
};

export const recommendationService = {
  getRecommendations: () => api.get('/recommendations'),
};

export default api;
