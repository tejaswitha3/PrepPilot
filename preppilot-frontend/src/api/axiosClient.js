import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('preppilot_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const hasAuthorization = Boolean(error.config?.headers?.Authorization);
    if (hasAuthorization && (status === 401 || status === 422)) {
      window.dispatchEvent(new Event('preppilot:invalid-token'));
    }
    return Promise.reject(error);
  }
);

export default api;
