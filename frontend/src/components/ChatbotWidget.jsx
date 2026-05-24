import { useState } from 'react';
import api from '../api/axios';

export default function ChatbotWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([{ sender: 'bot', text: 'Hello! I am your Smart City AI Assistant. Ask me about traffic, hospitals, pollution, or report an issue.' }]);
  const [input, setInput] = useState('');

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg = { sender: 'user', text: input };
    setMessages([...messages, userMsg]);
    setInput('');

    try {
      const res = await api.post('/user/chatbot', { message: input });
      const botMsg = { sender: 'bot', text: res.data.response };
      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      setMessages((prev) => [...prev, { sender: 'bot', text: 'Error connecting to AI server.' }]);
    }
  };

  return (
    <>
      <button 
        className="btn btn-primary rounded-circle shadow-lg" 
        style={{ position: 'fixed', bottom: '20px', right: '20px', width: '60px', height: '60px', fontSize: '24px', zIndex: 1000 }}
        onClick={() => setIsOpen(!isOpen)}
      >
        💬
      </button>

      {isOpen && (
        <div className="card shadow-lg border-primary" style={{ position: 'fixed', bottom: '90px', right: '20px', width: '350px', height: '450px', zIndex: 1000, backgroundColor: '#1a1d20' }}>
          <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center">
            <strong>🤖 Smart City AI</strong>
            <button className="btn-close btn-close-white" onClick={() => setIsOpen(false)}></button>
          </div>
          <div className="card-body overflow-auto d-flex flex-column gap-2" style={{ height: '320px' }}>
            {messages.map((m, i) => (
              <div key={i} className={`p-2 rounded ${m.sender === 'user' ? 'bg-primary text-white align-self-end' : 'bg-secondary text-light align-self-start'}`} style={{ maxWidth: '80%' }}>
                {m.text}
              </div>
            ))}
          </div>
          <div className="card-footer bg-dark border-secondary">
            <form onSubmit={sendMessage} className="d-flex gap-2">
              <input type="text" className="form-control bg-dark text-light border-secondary" placeholder="Type a message..." value={input} onChange={(e) => setInput(e.target.value)} />
              <button type="submit" className="btn btn-primary">Send</button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
