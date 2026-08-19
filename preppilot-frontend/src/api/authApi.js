import api from './axiosClient';

export const registerUser = (payload) => api.post('/api/auth/register', payload);
export const loginUser = (payload) => api.post('/api/auth/login', payload);
export const fetchCurrentUser = () => api.get('/api/auth/me');
