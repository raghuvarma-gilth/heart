'use client';
import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '@/context/ThemeContext';
import { api } from '@/lib/api';
import { FiMessageCircle, FiSend, FiUser, FiCpu } from 'react-icons/fi';
import toast from 'react-hot-toast';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function ChatPage() {
  const { dark } = useTheme();
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: "👋 Hello! I'm CardioMind AI Assistant. I'm here to help you with heart health questions, wellness tips, and general health guidance.\n\nHow can I help you today?" }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    const userMsg = input.trim();
    setInput('');
    setMessages(p => [...p, { role: 'user', content: userMsg }]);
    setLoading(true);

    try {
      const res = await api.grokChat(userMsg, messages);
      setMessages(p => [...p, { role: 'assistant', content: res.response || res.error || 'No response available' }]);
    } catch {
      setMessages(p => [...p, { role: 'assistant', content: 'Sorry, I encountered an error. Please try again.' }]);
    }
    setLoading(false);
  };

  const quickQuestions = [
    'What are heart attack symptoms?',
    'How to lower cholesterol?',
    'Best exercises for heart health?',
    'How does stress affect the heart?',
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-6rem)]">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-4">
        <h1 className="text-2xl font-bold flex items-center gap-2"><FiMessageCircle className="text-purple-400" /> AI Health Assistant</h1>
        <p className={`text-sm ${dark ? 'text-white/50' : 'text-gray-500'}`}>Chat with CardioMind AI for health guidance</p>
      </motion.div>

      {/* Chat messages */}
      <div className="flex-1 glass-card !p-4 overflow-y-auto mb-4 space-y-4">
        {messages.map((msg, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}
          >
            {msg.role === 'assistant' && (
              <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center shrink-0 mt-0.5">
                <FiCpu className="text-white text-xs" />
              </div>
            )}
            <div className={`max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
              msg.role === 'user'
                ? 'bg-red-500/20 text-white border border-red-500/20 rounded-br-sm'
                : dark
                ? 'bg-white/5 text-white/80 border border-white/5 rounded-bl-sm'
                : 'bg-gray-100 text-gray-700 border border-gray-200 rounded-bl-sm'
            }`}>
              <div className="whitespace-pre-wrap">{msg.content}</div>
            </div>
            {msg.role === 'user' && (
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${dark ? 'bg-white/10' : 'bg-gray-200'}`}>
                <FiUser className="text-xs" />
              </div>
            )}
          </motion.div>
        ))}
        {loading && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center shrink-0">
              <FiCpu className="text-white text-xs" />
            </div>
            <div className={`rounded-2xl px-4 py-3 rounded-bl-sm ${dark ? 'bg-white/5 border border-white/5' : 'bg-gray-100 border border-gray-200'}`}>
              <div className="flex gap-1">
                {[0, 1, 2].map(i => (
                  <motion.div key={i} className="w-2 h-2 rounded-full bg-red-400" animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }} />
                ))}
              </div>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Quick questions */}
      {messages.length <= 1 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {quickQuestions.map(q => (
            <button key={q} onClick={() => { setInput(q); }} className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all border ${dark ? 'border-white/10 bg-white/5 text-white/60 hover:bg-white/10' : 'border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100'}`}>
              {q}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="flex gap-3">
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && sendMessage()}
          placeholder="Ask CardioMind AI anything about your health..."
          className={`input-field flex-1 ${!dark && 'input-field-light'}`}
        />
        <button onClick={sendMessage} disabled={loading || !input.trim()} className="btn-primary !px-5 disabled:opacity-50">
          <FiSend />
        </button>
      </div>
    </div>
  );
}
