import api from './axiosClient';

export const fetchProfile = () => api.get('/api/profile');
export const updateProfile = (payload) => api.put('/api/profile', payload);
