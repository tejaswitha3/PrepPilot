import api from './axiosClient';

export const fetchProgress = () => api.get('/api/progress');
export const fetchCategoryProgress = () => api.get('/api/progress/categories');
