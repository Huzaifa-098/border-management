import React, { useEffect, useRef } from 'react';
import { User, Chat, Message, MessageType } from '../types';
import { MessageBubble } from './MessageBubble';
import { MessageInput } from './MessageInput';
import { MoreVertical, Search, Phone, Video, ShieldCheck } from 'lucide-react';

interface ChatWindowProps {
  activeChat: Chat | null;
  currentUser: User;
  onSendMessage: (content: string, type: MessageType) => void;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({ activeChat, currentUser, onSendMessage }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [activeChat?.messages]);

  if (!activeChat) {
    return (
      <div className="hidden md:flex flex-1 flex-col items-center justify-center bg-[#f0f2f5] border-b-[6px] border-[#25d366]">
         <div className="text-center">
            <h1 className="text-3xl font-light text-gray-500 mb-4">Gemini Connect</h1>
            <p className="text-gray-500">Send and receive messages with AI-powered intelligence.</p>
            <p className="text-gray-400 text-sm mt-2">Use Gemini 3 Pro Preview for coding, reasoning and creative tasks.</p>
         </div>
      </div>
    );
  }

  const otherParticipant = activeChat.participants.find(p => p.id !== currentUser.id);

  return (
    <div className="flex-1 flex flex-col h-full bg-[#efeae2] relative">
      {/* Chat Header */}
      <header className="flex items-center justify-between px-4 py-2.5 bg-[#f0f2f5] border-b border-gray-200 z-10">
        <div className="flex items-center gap-3 cursor-pointer">
          <img
            src={otherParticipant?.avatar || 'https://picsum.photos/40/40'}
            alt="Avatar"
            className="w-10 h-10 rounded-full object-cover"
          />
          <div className="flex flex-col">
            <h2 className="text-gray-800 font-medium flex items-center gap-1">
              {otherParticipant?.name}
              {otherParticipant?.isSuperAdmin && <ShieldCheck size={16} className="text-green-600" />}
            </h2>
            <p className="text-xs text-gray-500">
               {activeChat.isTyping ? <span className="text-green-600 font-bold">typing...</span> : (otherParticipant?.isOnline ? 'online' : 'click for info')}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-4 text-gray-500">
          <button className="p-2 hover:bg-gray-200 rounded-full transition"><Video size={20} /></button>
          <button className="p-2 hover:bg-gray-200 rounded-full transition"><Phone size={20} /></button>
          <div className="w-[1px] h-6 bg-gray-300 mx-1"></div>
          <button className="p-2 hover:bg-gray-200 rounded-full transition"><Search size={20} /></button>
          <button className="p-2 hover:bg-gray-200 rounded-full transition"><MoreVertical size={20} /></button>
        </div>
      </header>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 chat-background relative">
        <div className="flex flex-col justify-end min-h-full">
            {/* Encryption notice mock */}
            <div className="flex justify-center mb-4">
                <span className="bg-[#ffeecd] text-xs text-gray-600 px-3 py-1.5 rounded-lg shadow-sm text-center max-w-[90%]">
                    Messages are end-to-end encrypted. No one outside of this chat, not even Gemini Connect, can read or listen to them.
                </span>
            </div>

            {activeChat.messages.map((msg) => (
            <MessageBubble
                key={msg.id}
                message={msg}
                isOwn={msg.senderId === currentUser.id}
                showSenderName={false} // 1-on-1 chats usually don't show names
            />
            ))}
            <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <MessageInput 
        onSendMessage={(content) => onSendMessage(content, MessageType.TEXT)} 
        onSendMedia={() => alert("Media upload simulation")} 
      />
    </div>
  );
};