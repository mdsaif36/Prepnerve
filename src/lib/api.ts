import axios from 'axios';

// Pointing to your Live Render Server
const api = axios.create({
  baseURL: 'https://prepnerveserver.onrender.com', 
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
