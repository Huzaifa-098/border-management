import React, { useState, useRef, useEffect } from 'react';
import { Smile, Paperclip, Mic, Send } from 'lucide-react';

interface MessageInputProps {
  onSendMessage: (content: string) => void;
  onSendMedia?: (file: File) => void;
}

export const MessageInput: React.FC<MessageInputProps> = ({ onSendMessage, onSendMedia }) => {
  const [message, setMessage] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [message]);

  const handleSend = () => {
    if (message.trim()) {
      onSendMessage(message);
      setMessage('');
      if (textareaRef.current) textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0] && onSendMedia) {
      onSendMedia(e.target.files[0]);
    }
  };

  return (
    <div className="px-4 py-2 bg-[#f0f2f5] flex items-end gap-2 border-t border-gray-200">
      <div className="flex gap-2 pb-2 text-gray-500">
        <button className="hover:text-gray-700 transition" aria-label="Emoji">
          <Smile size={24} />
        </button>
        <button 
            className="hover:text-gray-700 transition" 
            aria-label="Attach"
            onClick={() => fileInputRef.current?.click()}
        >
          <Paperclip size={24} />
        </button>
        <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            onChange={handleFileChange}
        />
      </div>
      
      <div className="flex-1 bg-white rounded-lg px-4 py-2 flex items-center border border-gray-100 focus-within:ring-1 focus-within:ring-white">
        <textarea
          ref={textareaRef}
          rows={1}
          placeholder="Type a message"
          className="w-full bg-transparent border-none focus:ring-0 resize-none text-gray-800 placeholder-gray-500 max-h-[120px] overflow-y-auto"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
        />
      </div>

      <div className="pb-1">
        {message.trim() ? (
          <button 
            onClick={handleSend}
            className="p-2 bg-[#00a884] text-white rounded-full hover:bg-[#008f6f] transition shadow-sm"
            aria-label="Send"
          >
            <Send size={20} />
          </button>
        ) : (
          <button 
            className="p-2 text-gray-500 hover:bg-gray-200 rounded-full transition"
            aria-label="Voice Message"
          >
            <Mic size={24} />
          </button>
        )}
      </div>
    </div>
  );
};