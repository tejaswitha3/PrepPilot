import api from './axiosClient';

export const fetchNotes = () => api.get('/api/notes');
export const createNote = (payload) => api.post('/api/notes', payload);
export const updateNote = (id, payload) => api.put(`/api/notes/${id}`, payload);
export const deleteNote = (id) => api.delete(`/api/notes/${id}`);
