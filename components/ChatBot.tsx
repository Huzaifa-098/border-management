import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, Loader2, Bot } from 'lucide-react';
import { createChatSession, sendMessage } from '../services/geminiService';
import { Chat } from '@google/genai';
import { useStore } from '../services/mockStore';

export const ChatBot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<{ role: 'user' | 'model'; text: string }[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [chatSession, setChatSession] = useState<Chat | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { currentRole } = useStore();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  // Initialize Chat Session
  useEffect(() => {
    const initChat = async () => {
      const systemInstruction = `You are a helpful AI assistant for the Puntland Border Management System (PBMS). 
      Current User Role: ${currentRole}.
      Your goal is to assist users (end-users, city admins, super admins) with their tasks.
      For users: 
      - Help them understand what info is needed for entry (Name, Vehicle, Purpose, etc.).
      - Explain that they can add MULTIPLE travelers in a single vehicle submission using the "Add Traveler" button.
      - Explain that after submission, an invoice/permit is generated upon approval.
      For Admins: Explain workflows (Pending City -> Pending Super -> Approved).
      Keep answers concise and professional.`;
      
      const session = await createChatSession(systemInstruction);
      setChatSession(session);
    };
    initChat();
  }, [currentRole]);

  const handleSend = async () => {
    if (!input.trim() || !chatSession) return;

    const userMsg = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsLoading(true);

    const responseText = await sendMessage(chatSession, userMsg);
    
    setMessages(prev => [...prev, { role: 'model', text: responseText }]);
    setIsLoading(false);
  };

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 h-14 w-14 bg-gradient-to-br from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-2xl shadow-xl shadow-blue-500/30 flex items-center justify-center transition-all hover:scale-105 hover:-translate-y-0.5 z-50 ring-4 ring-white"
      >
        <MessageCircle size={26} />
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 w-[380px] h-[520px] pbms-glass rounded-2xl shadow-2xl shadow-slate-300/40 flex flex-col z-50 border border-white/80 overflow-hidden pbms-animate-in">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-4 flex items-center justify-between text-white">
        <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-white/20 rounded-lg"><Bot size={18} /></div>
            <div>
              <h3 className="font-bold text-sm">AI Assistant</h3>
              <p className="text-[10px] text-blue-100">Puntland BMS Help</p>
            </div>
        </div>
        <button onClick={() => setIsOpen(false)} className="hover:bg-white/20 p-1.5 rounded-lg transition-colors">
          <X size={18} />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
        {messages.length === 0 && (
          <div className="text-center text-slate-400 text-sm mt-10">
            <Bot size={40} className="mx-auto mb-2 opacity-50" />
            <p>Hello! How can I help you with the Border System today?</p>
          </div>
        )}
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm ${
              msg.role === 'user' 
                ? 'bg-blue-600 text-white rounded-br-none' 
                : 'bg-white border border-slate-200 text-slate-800 rounded-bl-none shadow-sm'
            }`}>
              {msg.text}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
             <div className="bg-white border border-slate-200 rounded-2xl rounded-bl-none px-4 py-2 shadow-sm">
                <Loader2 className="animate-spin text-blue-500" size={16} />
             </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-3 border-t border-slate-100 bg-white">
        <div className="flex items-center gap-2 bg-slate-100 rounded-full px-4 py-2 border border-slate-200 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent transition-all">
            <input 
              type="text" 
              className="flex-1 bg-transparent outline-none text-sm text-slate-800 placeholder-slate-400"
              placeholder="Type your question..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            />
            <button 
                onClick={handleSend} 
                disabled={isLoading || !input.trim()}
                className="text-blue-600 hover:text-blue-800 disabled:opacity-50 transition-colors"
            >
                <Send size={18} />
            </button>
        </div>
        {!process.env.API_KEY && (
             <p className="text-[10px] text-red-500 mt-1 text-center">API Key missing. Chat may fail.</p>
        )}
      </div>
    </div>
  );
};