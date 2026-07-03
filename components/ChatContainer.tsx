
import React, { useState, useCallback, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid'; // Standard practice would be to use a library, but I'll use a simple random gen helper since I can't guarantee packages
import { MessageList } from './MessageList';
import { InputArea } from './InputArea';
import { Message, LoadingState } from '../types';
import { sendMessageStream, createChatSession } from '../services/geminiService';
import { GenerateContentResponse, Chat } from '@google/genai';

// Simple UUID generator fallback
const generateId = () => Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

export const ChatContainer: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loadingState, setLoadingState] = useState<LoadingState>(LoadingState.IDLE);
  const [chatSession, setChatSession] = useState<Chat | null>(null);

  // Initialize Chat Session
  useEffect(() => {
    const init = async () => {
        try {
            const chat = await createChatSession("You are a helpful assistant.");
            setChatSession(chat);
        } catch (e) {
            console.error("Failed to init chat", e);
        }
    }
    init();
  }, []);

  const handleSendMessage = useCallback(async (text: string) => {
    if (!text.trim()) return;

    // Use existing chat session or wait for it (simple check here)
    if (!chatSession) {
        console.warn("Chat session not ready");
        // Optionally try to re-init or show error
        return;
    }

    const userMessage: Message = {
      id: generateId(),
      role: 'user',
      text: text.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setLoadingState(LoadingState.LOADING);

    // Placeholder for model response
    const modelMessageId = generateId();
    const modelMessage: Message = {
      id: modelMessageId,
      role: 'model',
      text: '', // Starts empty
      timestamp: new Date(),
      isStreaming: true,
    };

    setMessages((prev) => [...prev, modelMessage]);

    try {
      const stream = await sendMessageStream(chatSession, text);
      
      let fullText = '';
      setLoadingState(LoadingState.STREAMING);

      for await (const chunk of stream) {
        // Safe casting based on SDK guidance
        const contentResponse = chunk as GenerateContentResponse;
        const newText = contentResponse.text || '';
        fullText += newText;

        setMessages((prev) => 
          prev.map((msg) => 
            msg.id === modelMessageId 
              ? { ...msg, text: fullText } 
              : msg
          )
        );
      }
      
      // Finalize message
      setMessages((prev) => 
        prev.map((msg) => 
          msg.id === modelMessageId 
            ? { ...msg, isStreaming: false } 
            : msg
        )
      );
      setLoadingState(LoadingState.IDLE);

    } catch (error) {
      console.error("Failed to generate response", error);
      setMessages((prev) => 
        prev.map((msg) => 
          msg.id === modelMessageId 
            ? { 
                ...msg, 
                text: "Sorry, I encountered an error while processing your request. Please try again.",
                isError: true,
                isStreaming: false 
              } 
            : msg
        )
      );
      setLoadingState(LoadingState.ERROR);
    }
  }, [chatSession]);

  return (
    <div className="flex flex-col h-full w-full">
      <MessageList messages={messages} />
      <InputArea 
        onSend={handleSendMessage} 
        isLoading={loadingState === LoadingState.LOADING || loadingState === LoadingState.STREAMING} 
      />
    </div>
  );
};
