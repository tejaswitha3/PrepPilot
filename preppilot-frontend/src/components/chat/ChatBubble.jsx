import React from 'react';

export default function ChatBubble({ role, text }) {
  const isUser = role === 'user';
  return (
    <div style={{ display: 'flex', justifyContent: isUser ? 'flex-end' : 'flex-start', marginBottom: '0.5rem' }}>
      <div style={{ maxWidth: '70%', padding: '0.6rem', borderRadius: '10px', background: isUser ? '#dbeafe' : '#f3f4f6' }}>
        <div style={{ fontSize: '0.9rem', color: '#111' }}>{text}</div>
      </div>
    </div>
  );
}
export default function ChatBubble() {
  return <div>Chat Bubble</div>;
}
