import { GoogleGenAI, Chat, GenerateContentResponse } from "@google/genai";

const getApiKey = () => process.env.API_KEY || '';

export const hasApiKey = async (): Promise<boolean> => {
  if ((window as any).aistudio && (window as any).aistudio.hasSelectedApiKey) {
    return await (window as any).aistudio.hasSelectedApiKey();
  }
  return !!getApiKey();
};

export const requestApiKey = async (): Promise<void> => {
  if ((window as any).aistudio && (window as any).aistudio.openSelectKey) {
    await (window as any).aistudio.openSelectKey();
  }
};

const getClient = () => {
  const apiKey = getApiKey();
  if (!apiKey) return null;
  return new GoogleGenAI({ apiKey });
};

export const createChatSession = async (systemInstruction: string): Promise<Chat | null> => {
  const ai = getClient();
  if (!ai) return null;

  try {
    return ai.chats.create({
      model: 'gemini-3-pro-preview',
      config: {
        systemInstruction,
      },
    });
  } catch (error) {
    console.error("Error creating chat session:", error);
    return null;
  }
};

export const sendMessage = async (chat: Chat, message: string): Promise<string> => {
  try {
    const response: GenerateContentResponse = await chat.sendMessage({ message });
    return response.text || "I'm sorry, I couldn't generate a response.";
  } catch (error) {
    console.error("Error sending message to Gemini:", error);
    return "Error communicating with the AI service.";
  }
};

export const sendMessageStream = async (chat: Chat, message: string) => {
  try {
    const result = await chat.sendMessageStream({ message });
    return result;
  } catch (error) {
    console.error("Error sending message stream to Gemini:", error);
    throw error;
  }
};
