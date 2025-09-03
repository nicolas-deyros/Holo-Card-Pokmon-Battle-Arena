import React from 'react';

export interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void;
}

export type ToastType = 'success' | 'error' | 'warning' | 'info';

const ToastContext = React.createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = React.useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export { ToastContext };
