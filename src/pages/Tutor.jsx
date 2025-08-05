import React from 'react';
import ChatInterface from '../components/chat/ChatInterface';

const Tutor = () => {
  return (
    <div className="h-[calc(100vh-120px)]">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">AI Legal Tutor</h1>
        <p className="text-gray-600">
          Ask questions about legal concepts, cases, and principles. The AI tutor will provide detailed explanations with relevant examples.
        </p>
      </div>
      
      <div className="h-[calc(100%-100px)]">
        <ChatInterface />
      </div>
    </div>
  );
};

export default Tutor;