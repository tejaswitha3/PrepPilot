import React, { useState } from 'react';

export default function ChatInput({ onSend, disabled }) {
  const [text, setText] = useState('');

  const send = () => {
    const t = text.trim();
    if (!t) return;
    onSend(t);
    setText('');
  };

  const onKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  return (
    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
      <textarea value={text} onChange={(e) => setText(e.target.value)} onKeyDown={onKeyDown} rows={2} style={{ flex: 1, padding: '0.5rem' }} disabled={disabled} />
      <button type="button" onClick={send} disabled={disabled || !text.trim()}>{disabled ? '...' : 'Send'}</button>
    </div>
  );
}
export default function ChatInput() {
  return <div>Chat Input</div>;
}
