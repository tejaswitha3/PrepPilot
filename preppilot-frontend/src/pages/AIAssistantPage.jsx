import { useEffect, useState } from 'react';
import ChatWindow from '../components/chat/ChatWindow';
import ChatInput from '../components/chat/ChatInput';
import { sendChatMessage, fetchConversations, fetchConversationById } from '../api/chatApi';

export default function AIAssistantPage() {
  const [conversations, setConversations] = useState([]);
  const [selectedConvId, setSelectedConvId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const loadConversations = () => {
    fetchConversations()
      .then(({ data }) => setConversations(data || []))
      .catch(() => setConversations([]));
  };

  useEffect(() => {
    loadConversations();
  }, []);

  const loadConversation = (id) => {
    setError('');
    setLoading(true);
    fetchConversationById(id)
      .then(({ data }) => {
        setSelectedConvId(id);
        setMessages(data.messages.map((m) => ({ role: m.sender, text: m.content })) || []);
      })
      .catch((err) => setError(err?.response?.data?.error || err.message || 'Failed to load conversation'))
      .finally(() => setLoading(false));
  };

  const handleSend = (text) => {
    setError('');
    const userMsg = { role: 'user', text };
    setMessages((m) => [...m, userMsg]);
    setLoading(true);

    sendChatMessage({ message: text, conversation_id: selectedConvId })
      .then(({ data }) => {
        const reply = data.reply || 'No response';
        setMessages((m) => [...m, { role: 'assistant', text: reply }]);
        // reload conversations list to reflect new conversation or updated counts
        loadConversations();
        if (data.conversation_id && !selectedConvId) {
          setSelectedConvId(data.conversation_id);
        }
      })
      .catch((err) => {
        setError(err?.response?.data?.error || err.message || 'Chat failed');
      })
      .finally(() => setLoading(false));
  };

  const startNewConversation = () => {
    setSelectedConvId(null);
    setMessages([]);
  };

  return (
    <div style={{ padding: '2rem', display: 'flex', gap: '1rem' }}>
      <div style={{ width: '260px' }}>
        <h2>Conversations</h2>
        <button type="button" onClick={startNewConversation}>New Conversation</button>
        <ul style={{ listStyle: 'none', padding: 0, marginTop: '1rem' }}>
          {conversations.map((c) => (
            <li key={c.id} style={{ marginBottom: '0.5rem' }}>
              <button type="button" onClick={() => loadConversation(c.id)} style={{ width: '100%', textAlign: 'left' }}>{c.title || c.last_message || `Conversation ${c.id}`}</button>
            </li>
          ))}
        </ul>
      </div>

      <div style={{ flex: 1 }}>
        <h1>AI Assistant</h1>
        <p>Ask Preppilot for study tips, question explanations, and interview guidance.</p>

        <div style={{ maxWidth: 800 }}>
          <ChatWindow messages={messages} loading={loading} />
          {error && <div style={{ color: 'crimson', marginTop: '0.5rem' }}>{error}</div>}
          <ChatInput onSend={handleSend} disabled={loading} />
        </div>
      </div>
    </div>
  );
}
