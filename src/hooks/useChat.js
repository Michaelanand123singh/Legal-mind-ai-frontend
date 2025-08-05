import { useState, useCallback } from 'react';
import { chatAPI } from '../services/api';
import { getErrorMessage } from '../utils/helpers';

export const useChat = () => {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentTopic, setCurrentTopic] = useState(null);

  const sendMessage = useCallback(async (message, topic = null) => {
    if (!message.trim()) return;

    const userMessage = {
      role: 'user',
      content: message,
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    setError(null);

    try {
      const response = await chatAPI.sendMessage(message, topic);
      
      const assistantMessage = {
        role: 'assistant',
        content: response.response,
        timestamp: new Date().toISOString(),
        sources: response.sources || [],
      };

      setMessages(prev => [...prev, assistantMessage]);
      
      if (response.topic) {
        setCurrentTopic(response.topic);
      }
    } catch (err) {
      setError(getErrorMessage(err));
      
      // Add error message to chat
      const errorMessage = {
        role: 'assistant',
        content: 'Sorry, I encountered an error while processing your request. Please try again.',
        timestamp: new Date().toISOString(),
        isError: true,
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearMessages = useCallback(() => {
    setMessages([]);
    setError(null);
    setCurrentTopic(null);
  }, []);

  const setTopic = useCallback((topic) => {
    setCurrentTopic(topic);
  }, []);

  return {
    messages,
    isLoading,
    error,
    currentTopic,
    sendMessage,
    clearMessages,
    setTopic,
  };
};