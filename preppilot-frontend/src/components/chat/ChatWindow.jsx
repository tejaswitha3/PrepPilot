import React from 'react';
import ChatBubble from './ChatBubble';

export default function ChatWindow({ messages, loading }) {
  return (
    <div style={{ border: '1px solid #eee', padding: '1rem', borderRadius: '8px', height: '60vh', overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {messages.map((m, idx) => (
          <ChatBubble key={idx} role={m.role} text={m.text} />
        ))}
        {loading && <div style={{ color: '#666', fontStyle: 'italic' }}>Assistant is typing...</div>}
      </div>
    </div>
  );
}
export default function ChatWindow() {
  return <div>Chat Window</div>;
}
