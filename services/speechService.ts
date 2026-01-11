// Azure Speech Service - Text to Speech
/// <reference types="vite/client" />

const SPEECH_KEY = import.meta.env.VITE_AZURE_SPEECH_KEY;
const SPEECH_REGION = import.meta.env.VITE_AZURE_SPEECH_REGION || 'eastus';

let currentAudio: HTMLAudioElement | null = null;
let isBrowserSpeaking = false;

// Get language code for browser TTS (e.g., 'hi' -> 'hi-IN')
const getLanguageLocale = (langCode: string): string => {
  const localeMap: Record<string, string> = {
    'en': 'en-US',
    'hi': 'hi-IN',
    'te': 'te-IN',
    'ta': 'ta-IN',
    'kn': 'kn-IN',
    'ml': 'ml-IN',
    'mr': 'mr-IN',
    'bn': 'bn-IN',
    'gu': 'gu-IN',
    'pa': 'pa-IN',
    'es': 'es-ES',
    'fr': 'fr-FR',
    'de': 'de-DE',
    'zh': 'zh-CN',
    'ar': 'ar-SA',
  };
  return localeMap[langCode] || 'en-US';
};

export const speakText = async (
  text: string,
  voiceName: string = 'en-US-JennyNeural',
  languageCode: string = 'en'
): Promise<void> => {
  // Stop any currently playing audio
  stopSpeaking();

  // Try Azure TTS first if key is available
  if (SPEECH_KEY) {
    try {
      const ssml = `
        <speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="${getLanguageLocale(languageCode)}">
          <voice name="${voiceName}">
            ${escapeXml(text)}
          </voice>
        </speak>
      `;

      const response = await fetch(
        `https://${SPEECH_REGION}.tts.speech.microsoft.com/cognitiveservices/v1`,
        {
          method: 'POST',
          headers: {
            'Ocp-Apim-Subscription-Key': SPEECH_KEY,
            'Content-Type': 'application/ssml+xml',
            'X-Microsoft-OutputFormat': 'audio-16khz-128kbitrate-mono-mp3',
          },
          body: ssml,
        }
      );

      if (response.ok) {
        const audioBlob = await response.blob();
        const audioUrl = URL.createObjectURL(audioBlob);
        
        currentAudio = new Audio(audioUrl);
        currentAudio.onended = () => {
          URL.revokeObjectURL(audioUrl);
          currentAudio = null;
        };
        
        await currentAudio.play();
        return;
      }
    } catch (error) {
      console.warn('Azure TTS failed, falling back to browser TTS:', error);
    }
  }

  // Fallback to browser's built-in TTS
  speakWithBrowserTTS(text, languageCode);
};

export const stopSpeaking = (): void => {
  if (currentAudio) {
    currentAudio.pause();
    currentAudio = null;
  }
  // Also stop browser TTS if running
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
    isBrowserSpeaking = false;
  }
};

export const isSpeaking = (): boolean => {
  return (currentAudio !== null && !currentAudio.paused) || isBrowserSpeaking;
};

// Browser's built-in TTS with language support
const speakWithBrowserTTS = (text: string, languageCode: string = 'en'): void => {
  if (!('speechSynthesis' in window)) {
    console.error('Speech synthesis not supported');
    return;
  }

  const utterance = new SpeechSynthesisUtterance(text);
  const locale = getLanguageLocale(languageCode);
  
  // Try to find a voice for the selected language
  const voices = window.speechSynthesis.getVoices();
  const matchingVoice = voices.find(voice => 
    voice.lang.startsWith(languageCode) || voice.lang === locale
  );
  
  if (matchingVoice) {
    utterance.voice = matchingVoice;
  }
  
  utterance.lang = locale;
  utterance.rate = 0.9;
  utterance.pitch = 1;
  
  utterance.onstart = () => { isBrowserSpeaking = true; };
  utterance.onend = () => { isBrowserSpeaking = false; };
  utterance.onerror = () => { isBrowserSpeaking = false; };
  
  window.speechSynthesis.speak(utterance);
};

// Escape special XML characters
const escapeXml = (text: string): string => {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
};
