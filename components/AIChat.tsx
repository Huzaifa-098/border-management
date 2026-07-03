import React, { useState, useEffect, useRef } from 'react';
import { createChatSession, sendMessageStream } from '../services/geminiService';
import { ChatMessage } from '../types';
import { Send, Bot, User, X, Loader2, Sparkles, AlertCircle } from 'lucide-react';
import { GenerateContentResponse, Chat } from "@google/genai";

interface AIChatProps {
  contextData: any;
  isOpen: boolean;
  onClose: () => void;
}

export const AIChat: React.FC<AIChatProps> = ({ contextData, isOpen, onClose }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'model',
      text: "Hello! I'm PetroBot, powered by Gemini. I have access to real-time data on production, fleet, and safety. How can I assist you today?",
      timestamp: new Date(),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [chatSession, setChatSession] = useState<Chat | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && !chatSession) {
      const initChat = async () => {
        try {
          const contextString = JSON.stringify(contextData, null, 2);
          const session = await createChatSession(contextString);
          setChatSession(session);
        } catch (err) {
            console.error("Error initializing chat:", err);
            setError("Failed to initialize AI Assistant. Please check API Key.");
        }
      };
      initChat();
    }
  }, [isOpen, contextData, chatSession]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!inputText.trim() || !chatSession) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: inputText,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsLoading(true);
    setError(null);

    // Create a placeholder for the bot response
    const botMsgId = (Date.now() + 1).toString();
    setMessages((prev) => [
      ...prev,
      {
        id: botMsgId,
        role: 'model',
        text: '',
        timestamp: new Date(),
        isStreaming: true,
      },
    ]);

    try {
      const streamResult = await sendMessageStream(chatSession, userMsg.text);
      
      let fullText = '';
      
      for await (const chunk of streamResult) {
         const chunkText = (chunk as GenerateContentResponse).text;
         if (chunkText) {
             fullText += chunkText;
             setMessages((prev) => 
                prev.map((msg) => 
                    msg.id === botMsgId ? { ...msg, text: fullText } : msg
                )
             );
         }
      }

      setMessages((prev) =>
        prev.map((msg) => (msg.id === botMsgId ? { ...msg, isStreaming: false } : msg))
      );

    } catch (err) {
      console.error("Chat error:", err);
      setError("Communication error. Please try again.");
      setMessages((prev) => prev.filter(m => m.id !== botMsgId));
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-6 right-6 w-96 h-[600px] bg-white rounded-2xl shadow-2xl flex flex-col border border-slate-200 z-50 overflow-hidden font-sans ring-1 ring-black/5 animate-in slide-in-from-bottom-10 fade-in duration-300">
      {/* Header */}
      <div className="bg-slate-900 p-4 flex items-center justify-between text-white shrink-0">
        <div className="flex items-center gap-3">
          <div className="bg-amber-500 p-1.5 rounded-md">
            <Sparkles className="w-4 h-4 text-slate-900" />
          </div>
          <div>
            <h3 className="font-semibold text-sm">PetroBot Assistant</h3>
            <p className="text-xs text-slate-400">Gemini 3 Pro Preview</p>
          </div>
        </div>
        <button 
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50 scrollbar-hide">
        {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm flex items-center gap-2 border border-red-100">
                <AlertCircle className="w-4 h-4" />
                {error}
            </div>
        )}
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-start gap-2.5 ${
              msg.role === 'user' ? 'flex-row-reverse' : ''
            }`}
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                msg.role === 'user' ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-700'
              }`}
            >
              {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
            </div>
            <div
              className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-indigo-600 text-white rounded-tr-none'
                  : 'bg-white border border-slate-200 text-slate-700 shadow-sm rounded-tl-none'
              }`}
            >
              <div className="markdown-prose whitespace-pre-wrap">
                  {msg.text}
              </div>
              {msg.isStreaming && (
                 <span className="inline-block w-2 h-2 ml-2 bg-amber-500 rounded-full animate-pulse"></span>
              )}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white border-t border-slate-100 shrink-0">
        <div className="flex gap-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask about fleets, production, or alerts..."
            className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all text-slate-700 placeholder-slate-400"
            disabled={isLoading || !!error}
          />
          <button
            onClick={handleSend}
            disabled={isLoading || !inputText.trim() || !!error}
            className="bg-amber-500 hover:bg-amber-600 text-slate-900 p-2.5 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-md shadow-amber-500/20"
          >
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
          </button>
        </div>
      </div>
    </div>
  );
};
