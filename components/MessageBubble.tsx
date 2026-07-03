import React from 'react';
import { Message } from '../types';

interface MessageBubbleProps {
  message: Message;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const isUser = message.role === 'user';
  const isError = message.isError;

  return (
    <div className={`flex w-full ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`
          relative max-w-[85%] sm:max-w-[75%] rounded-2xl px-5 py-3.5 shadow-md
          ${isUser 
            ? 'bg-blue-600 text-white rounded-br-none' 
            : isError
              ? 'bg-red-900/50 text-red-200 border border-red-800 rounded-bl-none'
              : 'bg-slate-800 text-slate-100 border border-slate-700 rounded-bl-none'
          }
        `}
      >
        <div className="flex flex-col gap-1">
          <span className={`text-[10px] uppercase tracking-wider font-bold opacity-50 mb-1 ${isUser ? 'text-blue-100' : 'text-slate-400'}`}>
            {isUser ? 'You' : 'Gemini'}
          </span>
          
          <div className={`whitespace-pre-wrap leading-relaxed break-words text-sm sm:text-base ${message.isStreaming ? 'animate-pulse' : ''}`}>
             {/* Basic formatting for code blocks if markdown parser isn't available */}
             {message.text.split('```').map((part, index) => {
               if (index % 2 === 1) {
                 // Simple code block styling
                 return (
                   <div key={index} className="my-2 p-3 bg-black/30 rounded-md font-mono text-xs sm:text-sm overflow-x-auto border border-white/10">
                     {part.trim()}
                   </div>
                 );
               }
               return <span key={index}>{part}</span>;
             })}
          </div>
          
          <div className={`text-[10px] text-right mt-1 opacity-40 ${isUser ? 'text-blue-100' : 'text-slate-400'}`}>
            {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>
      </div>
    </div>
  );
};