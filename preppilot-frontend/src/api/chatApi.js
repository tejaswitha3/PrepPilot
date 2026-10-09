import api from './axiosClient';

export const fetchConversations = () =>
  api.get('/api/chat/conversations');

export const fetchChatStatus = () =>
  api.get('/api/chat/status');

export const fetchConversationById = (conversationId) =>
  api.get(`/api/chat/conversations/${conversationId}`);

export const sendChatMessage = (payload) =>
  api.post('/api/chat', payload);