// Minimal question API stubs used by the app; tests will mock these functions.
export function fetchPreparation() {
  return Promise.resolve({ data: { categories: [] } });
}

export function fetchAttempts() {
  return Promise.resolve({ data: [] });
}
import api from './axiosClient';

export const fetchQuestions = (params = {}) => api.get('/api/questions', { params });
export const fetchQuestionById = (id) => api.get(`/api/questions/${id}`);
export const submitAttempt = (id, payload) => api.post(`/api/questions/${id}/attempt`, payload);
export const fetchAttempts = (params = {}) => api.get('/api/attempts', { params });
export const fetchPreparation = (params = {}) => api.get('/api/preparation', { params });
