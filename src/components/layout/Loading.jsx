import React from 'react';

const Loading = ({ size = 'medium', text = 'Loading...' }) => {
  const sizeClasses = {
    small: 'h-6 w-6',
    medium: 'h-8 w-8',
    large: 'h-12 w-12',
  };

  return (
    <div className="flex flex-col items-center justify-center p-4">
      <div
        className={`${sizeClasses[size]} animate-spin rounded-full border-4 border-gray-300 border-t-primary-500`}
      ></div>
      {text && (
        <p className="mt-2 text-sm text-gray-600">{text}</p>
      )}
    </div>
  );
};

export const LoadingSpinner = ({ className = '' }) => (
  <div className={`animate-spin rounded-full h-6 w-6 border-2 border-gray-300 border-t-primary-500 ${className}`}></div>
);

export const FullPageLoading = ({ text = 'Loading...' }) => (
  <div className="min-h-screen flex items-center justify-center">
    <Loading size="large" text={text} />
  </div>
);

export default Loading;