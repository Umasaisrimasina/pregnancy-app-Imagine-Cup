import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { SUPPORTED_LANGUAGES } from '../services/translatorService';

interface LanguageContextType {
  language: string;
  languageName: string;
  setLanguage: (code: string) => void;
  supportedLanguages: typeof SUPPORTED_LANGUAGES;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const [language, setLanguageState] = useState<string>(() => {
    // Get saved language from localStorage or default to English
    return localStorage.getItem('preferredLanguage') || 'en';
  });

  const setLanguage = (code: string) => {
    setLanguageState(code);
    localStorage.setItem('preferredLanguage', code);
  };

  const languageName = SUPPORTED_LANGUAGES.find(l => l.code === language)?.name || 'English';

  useEffect(() => {
    // Sync with localStorage on mount
    const saved = localStorage.getItem('preferredLanguage');
    if (saved && saved !== language) {
      setLanguageState(saved);
    }
  }, []);

  return (
    <LanguageContext.Provider value={{ 
      language, 
      languageName,
      setLanguage, 
      supportedLanguages: SUPPORTED_LANGUAGES 
    }}>
      {children}
    </LanguageContext.Provider>
  );
};
