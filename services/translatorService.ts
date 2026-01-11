// Azure Translator Service
/// <reference types="vite/client" />

const TRANSLATOR_KEY = import.meta.env.VITE_AZURE_TRANSLATOR_KEY;
const TRANSLATOR_REGION = import.meta.env.VITE_AZURE_TRANSLATOR_REGION || 'eastus';

export interface TranslationResult {
  text: string;
  to: string;
}

export const translateText = async (
  text: string,
  targetLanguage: string,
  sourceLanguage: string = 'en'
): Promise<string> => {
  if (!TRANSLATOR_KEY) {
    console.error('Azure Translator key not configured');
    return text;
  }

  // Don't translate if same language
  if (targetLanguage === sourceLanguage) {
    return text;
  }

  try {
    // Use the global endpoint which has better CORS support
    const endpoint = `https://api.cognitive.microsofttranslator.com/translate?api-version=3.0&from=${sourceLanguage}&to=${targetLanguage}`;
    
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Ocp-Apim-Subscription-Key': TRANSLATOR_KEY,
        'Ocp-Apim-Subscription-Region': TRANSLATOR_REGION,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify([{ text }]),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Translation API error:', response.status, errorText);
      throw new Error(`Translation failed: ${response.status}`);
    }

    const data = await response.json();
    console.log('Translation result:', data);
    return data[0]?.translations?.[0]?.text || text;
  } catch (error) {
    console.error('Translation error:', error);
    // Return original text if translation fails
    return text;
  }
};

// Supported languages for translation and TTS
export const SUPPORTED_LANGUAGES = [
  { code: 'en', name: 'English', voiceName: 'en-US-JennyNeural' },
  { code: 'hi', name: 'हिन्दी (Hindi)', voiceName: 'hi-IN-SwaraNeural' },
  { code: 'te', name: 'తెలుగు (Telugu)', voiceName: 'te-IN-ShrutiNeural' },
  { code: 'ta', name: 'தமிழ் (Tamil)', voiceName: 'ta-IN-PallaviNeural' },
  { code: 'kn', name: 'ಕನ್ನಡ (Kannada)', voiceName: 'kn-IN-SapnaNeural' },
  { code: 'ml', name: 'മലയാളം (Malayalam)', voiceName: 'ml-IN-SobhanaNeural' },
  { code: 'mr', name: 'मराठी (Marathi)', voiceName: 'mr-IN-AarohiNeural' },
  { code: 'bn', name: 'বাংলা (Bengali)', voiceName: 'bn-IN-TanishaaNeural' },
  { code: 'gu', name: 'ગુજરાતી (Gujarati)', voiceName: 'gu-IN-DhwaniNeural' },
  { code: 'pa', name: 'ਪੰਜਾਬੀ (Punjabi)', voiceName: 'pa-IN-GurpreetNeural' },
  { code: 'es', name: 'Español (Spanish)', voiceName: 'es-ES-ElviraNeural' },
  { code: 'fr', name: 'Français (French)', voiceName: 'fr-FR-DeniseNeural' },
  { code: 'de', name: 'Deutsch (German)', voiceName: 'de-DE-KatjaNeural' },
  { code: 'zh', name: '中文 (Chinese)', voiceName: 'zh-CN-XiaoxiaoNeural' },
  { code: 'ar', name: 'العربية (Arabic)', voiceName: 'ar-SA-ZariyahNeural' },
];

export const getVoiceForLanguage = (languageCode: string): string => {
  const lang = SUPPORTED_LANGUAGES.find(l => l.code === languageCode);
  return lang?.voiceName || 'en-US-JennyNeural';
};
