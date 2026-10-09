import ChatBubble from './ChatBubble';

export default function ChatWindow({ messages, loading }) {
  return (
    <div
      aria-live="polite"
      style={{
        border: '1px solid #eee',
        padding: '1rem',
        borderRadius: '8px',
        height: '60vh',
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {messages.map((message, index) => (
        <ChatBubble key={`${message.role}-${index}`} role={message.role} text={message.text} />
      ))}
      {loading && <p role="status">Assistant is typing...</p>}
      {!messages.length && !loading && <p>Start a conversation by asking a study question.</p>}
    </div>
  );
}