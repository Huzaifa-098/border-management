
import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Loader2, User, Bot, Trash2 } from 'lucide-react';
import { ChatMessage } from '../types';
import { createChatSession, sendMessageStream } from '../services/geminiService';
import { Chat, GenerateContentResponse } from '@google/genai';

export const ChatWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'model',
      text: "Hello! I'm the Waayeel Fuel AI Assistant. How can I help you with operations today?",
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [chatSession, setChatSession] = useState<Chat | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const initChat = async () => {
      if (!chatSession && isOpen) {
        try {
          const session = await createChatSession("You are a helpful assistant for fuel operations.");
          setChatSession(session);
        } catch (e) {
          console.error("Failed to init chat", e);
        }
      }
    };
    initChat();
  }, [isOpen]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen, isLoading]);

  const handleClearChat = async () => {
    try {
      const session = await createChatSession("You are a helpful assistant for fuel operations.");
      setChatSession(session);
      setMessages([{
        id: 'welcome',
        role: 'model',
        text: "Chat history cleared. How can I help you now?",
        timestamp: new Date()
      }]);
    } catch (e) {
        console.error("Failed to reset chat", e);
    }
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;

    let currentSession = chatSession;
    if (!currentSession) {
        try {
            currentSession = await createChatSession("You are a helpful assistant for fuel operations.");
            setChatSession(currentSession);
        } catch(e) {
            console.error("Session creation failed", e);
            return;
        }
    }

    if (!currentSession) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: input.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    // Create a placeholder for the bot response
    const botMsgId = (Date.now() + 1).toString();
    const initialBotMsg: ChatMessage = {
      id: botMsgId,
      role: 'model',
      text: '',
      timestamp: new Date()
    };
    setMessages(prev => [...prev, initialBotMsg]);

    try {
      const stream = await sendMessageStream(currentSession, userMsg.text);
      let fullText = '';
      
      for await (const chunk of stream) {
        const content = chunk as GenerateContentResponse;
        if (content.text) {
            fullText += content.text;
            setMessages(prev => prev.map(msg => 
            msg.id === botMsgId ? { ...msg, text: fullText } : msg
            ));
        }
      }
    } catch (error) {
      console.error("Failed to fetch response", error);
      setMessages(prev => prev.map(msg => 
        msg.id === botMsgId ? { ...msg, text: "Sorry, I encountered an error. Please try again." } : msg
      ));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end space-y-4">
      {/* Chat Window */}
      {isOpen && (
        <div className="w-full max-w-[380px] sm:w-[380px] h-[500px] bg-white rounded-2xl shadow-2xl border border-gray-100 flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 fade-in duration-300">
          
          {/* Header */}
          <div className="bg-red-600 p-4 flex items-center justify-between text-white shadow-md">
            <div className="flex items-center space-x-2">
              <div className="p-1.5 bg-white/20 rounded-full">
                <Bot size={20} className="text-white" />
              </div>
              <div>
                <h3 className="font-bold text-sm">Waayeel AI Support</h3>
                <p className="text-xs text-red-100 flex items-center gap-1">
                  <span className="w-2 h-2 bg-green-400 rounded-full inline-block"></span>
                  Online • gemini-3-pro
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button 
                onClick={handleClearChat}
                className="p-1.5 hover:bg-white/20 rounded-full transition-colors text-red-100 hover:text-white"
                title="Clear Chat"
              >
                <Trash2 size={18} />
              </button>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-1.5 hover:bg-white/20 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'} items-end gap-2`}>
                  
                  {/* Avatar */}
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${
                    msg.role === 'user' ? 'bg-indigo-100 text-indigo-600' : 'bg-red-100 text-red-600'
                  }`}>
                    {msg.role === 'user' ? <User size={14} /> : <Bot size={14} />}
                  </div>

                  {/* Bubble */}
                  <div
                    className={`p-3 rounded-2xl text-sm leading-relaxed shadow-sm ${
                      msg.role === 'user'
                        ? 'bg-indigo-600 text-white rounded-br-none'
                        : 'bg-white text-gray-800 border border-gray-100 rounded-bl-none'
                    }`}
                  >
                    {msg.text || (isLoading && msg.id === messages[messages.length - 1].id ? 'Thinking...' : '')}
                  </div>
                </div>
              </div>
            ))}
            
            {/* Loading Indicator (only if waiting for first token) */}
            {isLoading && messages[messages.length - 1].role === 'user' && (
              <div className="flex justify-start w-full">
                <div className="flex items-end gap-2">
                  <div className="w-6 h-6 rounded-full bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                    <Bot size={14} />
                  </div>
                  <div className="bg-white p-3 rounded-2xl rounded-bl-none border border-gray-100 shadow-sm flex items-center gap-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <form onSubmit={handleSendMessage} className="p-3 bg-white border-t border-gray-100">
            <div className="flex items-center gap-2 bg-gray-100 rounded-full px-4 py-2 focus-within:ring-2 focus-within:ring-red-500/20 transition-all">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about operations..."
                className="flex-1 bg-transparent text-sm outline-none text-gray-700 placeholder-gray-400"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className={`p-2 rounded-full transition-colors ${
                  input.trim() && !isLoading
                    ? 'bg-red-600 text-white hover:bg-red-700 shadow-sm'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                {isLoading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
              </button>
            </div>
            <div className="text-center mt-2">
              <p className="text-[10px] text-gray-400">AI can make mistakes. Verify critical data.</p>
            </div>
          </form>
        </div>
      )}

      {/* Floating Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-14 h-14 rounded-full shadow-xl flex items-center justify-center transition-all duration-300 transform hover:scale-105 ${
          isOpen ? 'bg-gray-700 text-white rotate-90' : 'bg-red-600 text-white'
        }`}
      >
        {isOpen ? <X size={24} /> : <MessageCircle size={28} />}
      </button>
    </div>
  );
};
