import axios from 'axios';

// Get base URL. If in dev mode, it's typically localhost:5000.
const API_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
});

// Interceptor to add token to requests
api.interceptors.request.use((config) => {
  const authStore = localStorage.getItem('jobbernaukari-auth');
  if (authStore) {
    const { state } = JSON.parse(authStore);
    if (state?.token) {
      config.headers.Authorization = `Bearer ${state.token}`;
    }
  }
  return config;
});

export default api;
