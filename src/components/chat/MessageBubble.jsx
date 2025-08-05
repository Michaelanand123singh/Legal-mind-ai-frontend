import React from 'react';
import { formatDateTime } from '../../utils/helpers';

const MessageBubble = ({ message }) => {
  const isUser = message.role === 'user';
  const isError = message.isError;

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
        isUser 
          ? 'bg-primary-500 text-white' 
          : isError 
            ? 'bg-red-100 text-red-800' 
            : 'bg-gray-100 text-gray-900'
      }`}>
        <div className="whitespace-pre-wrap text-sm">{message.content}</div>
        
        {message.sources && message.sources.length > 0 && (
          <div className="mt-2 pt-2 border-t border-gray-200">
            <div className="text-xs text-gray-600 mb-1">Sources:</div>
            {message.sources.slice(0, 2).map((source, index) => (
              <div key={index} className="text-xs text-gray-600 truncate">
                • {source}
              </div>
            ))}
          </div>
        )}
        
        <div className={`text-xs mt-1 ${
          isUser ? 'text-primary-100' : 'text-gray-500'
        }`}>
          {formatDateTime(message.timestamp)}
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;