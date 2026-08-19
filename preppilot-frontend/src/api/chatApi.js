// Minimal chat API stubs used by the app; tests will mock these functions.
export function fetchConversations() {
  return Promise.resolve({ data: [] });
}

export function fetchConversationById(id) {
  return Promise.resolve({ data: { id, messages: [] } });
}

export function sendChatMessage(payload) {
  return Promise.resolve({ data: { reply: 'stub', conversation_id: null } });
}
import api from './axiosClient';

export const fetchConversations = () => api.get('/api/chat/conversations');
export const fetchConversationById = (conversationId) => api.get(`/api/chat/conversations/${conversationId}`);
export const sendChatMessage = (payload) => api.post('/api/chat', payload);
