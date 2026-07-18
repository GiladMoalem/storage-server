import { createContext, useContext, useMemo, useState } from 'react';
import type { ReactNode } from 'react';

interface AppContextValue {
  currentPath: string;
  setCurrentPath: (path: string) => void;
  toast: { message: string; type: 'success' | 'error' | 'info' } | null;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
}

const AppContext = createContext<AppContextValue | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [currentPath, setCurrentPath] = useState('.');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToast({ message, type });
    window.setTimeout(() => setToast(null), 3200);
  };

  const value = useMemo(
    () => ({ currentPath, setCurrentPath, toast, showToast }),
    [currentPath, toast],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used inside AppProvider');
  }
  return context;
}
