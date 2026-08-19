import { render, screen, waitFor } from '@testing-library/react';
import { vi } from 'vitest';

vi.mock('../../api/chatApi', () => ({
  fetchConversations: vi.fn(() => Promise.resolve({ data: [{ id: 1, title: 'Test', last_message: 'hello' }] })),
  fetchConversationById: vi.fn(() => Promise.resolve({ data: { id: 1, messages: [] } })),
  sendChatMessage: vi.fn(() => Promise.resolve({ data: { reply: 'ok', conversation_id: 1 } })),
}));

import AIAssistantPage from '../AIAssistantPage';

test('renders AI Assistant and conversation list', async () => {
  render(<AIAssistantPage />);

  expect(screen.getByText('AI Assistant')).toBeInTheDocument();
  // Conversations heading should appear
  expect(screen.getByText('Conversations')).toBeInTheDocument();

  // wait for conversation button to appear
  await waitFor(() => expect(screen.getByRole('button', { name: /Test|Conversation 1/ })).toBeInTheDocument());
});
