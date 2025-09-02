
import React from 'react';

export const LoadingSpinner: React.FC = () => (
  <div className="flex justify-center items-center p-8">
    <div className="w-16 h-16 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin" />
  </div>
);
