import React, { useState } from 'react';
import { Volume2, VolumeX, Loader2 } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { translateText, getVoiceForLanguage } from '../services/translatorService';
import { speakText, stopSpeaking, isSpeaking } from '../services/speechService';

interface SpeakableTextProps {
  children: React.ReactNode;
  text?: string; // Optional override for the text to speak
  className?: string;
  iconSize?: number;
  iconClassName?: string;
  inline?: boolean;
}

export const SpeakableText: React.FC<SpeakableTextProps> = ({
  children,
  text,
  className = '',
  iconSize = 16,
  iconClassName = '',
  inline = false,
}) => {
  const { language } = useLanguage();
  const [isLoading, setIsLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  const getTextContent = (): string => {
    if (text) return text;
    
    // Extract text from children
    const extractText = (node: React.ReactNode): string => {
      if (typeof node === 'string' || typeof node === 'number') {
        return String(node);
      }
      if (Array.isArray(node)) {
        return node.map(extractText).join(' ');
      }
      if (React.isValidElement(node) && (node.props as any).children) {
        return extractText((node.props as any).children);
      }
      return '';
    };
    
    return extractText(children);
  };

  const handleSpeak = async () => {
    if (isPlaying) {
      stopSpeaking();
      setIsPlaying(false);
      return;
    }

    const textToSpeak = getTextContent();
    if (!textToSpeak.trim()) return;

    setIsLoading(true);
    setIsPlaying(true);
    
    try {
      // Translate if not English
      let translatedText = textToSpeak;
      if (language !== 'en') {
        console.log(`Translating to ${language}:`, textToSpeak.substring(0, 50) + '...');
        translatedText = await translateText(textToSpeak, language);
        console.log('Translated text:', translatedText.substring(0, 50) + '...');
      }

      // Get the appropriate voice for the language
      const voiceName = getVoiceForLanguage(language);
      console.log(`Speaking in ${language} with voice ${voiceName}`);

      await speakText(translatedText, voiceName, language);
    } catch (error) {
      console.error('Error speaking text:', error);
    } finally {
      setIsLoading(false);
      setIsPlaying(false);
    }
  };

  const Wrapper = inline ? 'span' : 'div';

  return (
    <Wrapper className={`group ${inline ? 'inline-flex items-center gap-1' : 'flex items-start gap-2'} ${className}`}>
      <span className={inline ? '' : 'flex-1'}>{children}</span>
      <button
        onClick={handleSpeak}
        disabled={isLoading}
        className={`
          flex-shrink-0 p-1.5 rounded-full transition-all
          ${isPlaying 
            ? 'bg-emerald-100 text-emerald-600' 
            : 'bg-slate-100 text-slate-500 hover:bg-emerald-50 hover:text-emerald-600'}
          ${inline ? 'opacity-0 group-hover:opacity-100' : ''}
          disabled:opacity-50 disabled:cursor-not-allowed
          ${iconClassName}
        `}
        title={isPlaying ? 'Stop speaking' : 'Listen in your language'}
        aria-label={isPlaying ? 'Stop speaking' : 'Listen in your language'}
      >
        {isLoading ? (
          <Loader2 size={iconSize} className="animate-spin" />
        ) : isPlaying ? (
          <VolumeX size={iconSize} />
        ) : (
          <Volume2 size={iconSize} />
        )}
      </button>
    </Wrapper>
  );
};

// Simpler component for just the speak button
interface SpeakButtonProps {
  text: string;
  size?: number;
  className?: string;
}

export const SpeakButton: React.FC<SpeakButtonProps> = ({ 
  text, 
  size = 16, 
  className = '' 
}) => {
  const { language } = useLanguage();
  const [isLoading, setIsLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  const handleSpeak = async () => {
    if (isPlaying) {
      stopSpeaking();
      setIsPlaying(false);
      return;
    }

    if (!text.trim()) return;

    setIsLoading(true);
    setIsPlaying(true);
    
    try {
      let translatedText = text;
      if (language !== 'en') {
        console.log(`Translating to ${language}:`, text.substring(0, 50) + '...');
        translatedText = await translateText(text, language);
        console.log('Translated text:', translatedText.substring(0, 50) + '...');
      }

      const voiceName = getVoiceForLanguage(language);
      console.log(`Speaking in ${language} with voice ${voiceName}`);
      await speakText(translatedText, voiceName, language);
    } catch (error) {
      console.error('Error speaking text:', error);
    } finally {
      setIsLoading(false);
      setIsPlaying(false);
    }
  };

  return (
    <button
      onClick={handleSpeak}
      disabled={isLoading}
      className={`
        p-1.5 rounded-full transition-all
        ${isPlaying 
          ? 'bg-emerald-100 text-emerald-600' 
          : 'bg-slate-100 text-slate-500 hover:bg-emerald-50 hover:text-emerald-600'}
        disabled:opacity-50 disabled:cursor-not-allowed
        ${className}
      `}
      title={isPlaying ? 'Stop speaking' : 'Listen in your language'}
    >
      {isLoading ? (
        <Loader2 size={size} className="animate-spin" />
      ) : isPlaying ? (
        <VolumeX size={size} />
      ) : (
        <Volume2 size={size} />
      )}
    </button>
  );
};
