// Azure AI Language - Sentiment Analysis Service
/// <reference types="vite/client" />

const LANGUAGE_ENDPOINT = import.meta.env.VITE_AZURE_LANGUAGE_ENDPOINT;
const LANGUAGE_KEY = import.meta.env.VITE_AZURE_LANGUAGE_KEY;

export interface SentimentResult {
  sentiment: 'positive' | 'neutral' | 'negative' | 'mixed';
  confidenceScores: {
    positive: number;
    neutral: number;
    negative: number;
  };
  sentences?: Array<{
    text: string;
    sentiment: string;
    confidenceScores: {
      positive: number;
      neutral: number;
      negative: number;
    };
  }>;
}

/**
 * Analyze sentiment of text using Azure AI Language
 * Returns sentiment classification and confidence scores
 */
export const analyzeSentiment = async (text: string): Promise<SentimentResult> => {
  // Validate inputs
  if (!text || text.trim().length === 0) {
    return {
      sentiment: 'neutral',
      confidenceScores: { positive: 0, neutral: 1, negative: 0 }
    };
  }

  // Check if Azure credentials are configured
  if (!LANGUAGE_KEY || !LANGUAGE_ENDPOINT) {
    console.warn('Azure Language credentials not configured, using fallback sentiment analysis');
    return fallbackSentimentAnalysis(text);
  }

  try {
    const response = await fetch(
      `${LANGUAGE_ENDPOINT}/text/analytics/v3.1/sentiment`,
      {
        method: 'POST',
        headers: {
          'Ocp-Apim-Subscription-Key': LANGUAGE_KEY,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          documents: [
            { id: '1', language: 'en', text: text.substring(0, 5000) } // Azure limit is 5120 chars
          ]
        })
      }
    );

    if (!response.ok) {
      console.error('Azure Sentiment API error:', response.status);
      return fallbackSentimentAnalysis(text);
    }

    const data = await response.json();
    
    if (data.documents && data.documents.length > 0) {
      const doc = data.documents[0];
      return {
        sentiment: doc.sentiment as SentimentResult['sentiment'],
        confidenceScores: doc.confidenceScores,
        sentences: doc.sentences
      };
    }

    return fallbackSentimentAnalysis(text);
  } catch (error) {
    console.error('Error analyzing sentiment:', error);
    return fallbackSentimentAnalysis(text);
  }
};

/**
 * Fallback sentiment analysis using keyword matching
 * Used when Azure API is unavailable
 */
const fallbackSentimentAnalysis = (text: string): SentimentResult => {
  const lowerText = text.toLowerCase();
  
  // Positive keywords
  const positiveWords = [
    'happy', 'joy', 'love', 'great', 'amazing', 'wonderful', 'excited', 'blessed',
    'grateful', 'thankful', 'smile', 'beautiful', 'best', 'fantastic', 'awesome',
    'good', 'better', 'healing', 'progress', 'hope', 'proud', 'celebration',
    '🎉', '💕', '😊', '🥰', '❤️', '💜', '😍', '🙏', '✨'
  ];
  
  // Negative keywords (important for mental health context)
  const negativeWords = [
    'sad', 'depressed', 'anxious', 'worried', 'scared', 'fear', 'cry', 'crying',
    'tired', 'exhausted', 'overwhelmed', 'struggling', 'hard', 'difficult', 'pain',
    'lonely', 'alone', 'hopeless', 'helpless', 'stressed', 'angry', 'frustrated',
    'can\'t cope', 'breaking down', 'give up', 'too much', 'no sleep',
    '😢', '😭', '😔', '😟', '😰', '😨', '💔'
  ];
  
  // Warning keywords (require immediate attention)
  const warningWords = [
    'harm', 'hurt myself', 'end it', 'can\'t go on', 'no point', 'suicide',
    'self-harm', 'want to die', 'give up on life'
  ];

  // Check for warning keywords first
  for (const word of warningWords) {
    if (lowerText.includes(word)) {
      return {
        sentiment: 'negative',
        confidenceScores: { positive: 0, neutral: 0.1, negative: 0.9 }
      };
    }
  }

  // Count keyword matches
  let positiveScore = 0;
  let negativeScore = 0;

  for (const word of positiveWords) {
    if (lowerText.includes(word)) positiveScore++;
  }

  for (const word of negativeWords) {
    if (lowerText.includes(word)) negativeScore++;
  }

  // Determine sentiment based on scores
  const total = positiveScore + negativeScore;
  
  if (total === 0) {
    return {
      sentiment: 'neutral',
      confidenceScores: { positive: 0.2, neutral: 0.6, negative: 0.2 }
    };
  }

  const positiveRatio = positiveScore / total;
  const negativeRatio = negativeScore / total;

  if (positiveRatio > 0.6) {
    return {
      sentiment: 'positive',
      confidenceScores: { 
        positive: Math.min(0.9, 0.5 + positiveRatio * 0.4), 
        neutral: 0.1, 
        negative: Math.max(0, 0.4 - positiveRatio * 0.4) 
      }
    };
  } else if (negativeRatio > 0.6) {
    return {
      sentiment: 'negative',
      confidenceScores: { 
        positive: Math.max(0, 0.4 - negativeRatio * 0.4), 
        neutral: 0.1, 
        negative: Math.min(0.9, 0.5 + negativeRatio * 0.4) 
      }
    };
  } else {
    return {
      sentiment: 'mixed',
      confidenceScores: { positive: 0.35, neutral: 0.3, negative: 0.35 }
    };
  }
};

/**
 * Convert sentiment to a numeric score (0-10) for trend tracking
 */
export const sentimentToScore = (sentiment: SentimentResult): number => {
  const { confidenceScores } = sentiment;
  // Score: 0 = very negative, 5 = neutral, 10 = very positive
  return Math.round(
    (confidenceScores.positive * 10) + 
    (confidenceScores.neutral * 5) + 
    (confidenceScores.negative * 0)
  );
};

/**
 * Get sentiment badge info for UI display
 */
export const getSentimentBadge = (sentiment: SentimentResult['sentiment']): {
  label: string;
  emoji: string;
  color: string;
  bgColor: string;
  needsSupport: boolean;
} => {
  switch (sentiment) {
    case 'positive':
      return {
        label: 'Positive',
        emoji: '😊',
        color: 'text-emerald-600',
        bgColor: 'bg-emerald-50 border-emerald-200',
        needsSupport: false
      };
    case 'neutral':
      return {
        label: 'Neutral',
        emoji: '😐',
        color: 'text-slate-600',
        bgColor: 'bg-slate-50 border-slate-200',
        needsSupport: false
      };
    case 'negative':
      return {
        label: 'Needs Support',
        emoji: '⚠️',
        color: 'text-amber-700',
        bgColor: 'bg-amber-50 border-amber-200',
        needsSupport: true
      };
    case 'mixed':
      return {
        label: 'Mixed',
        emoji: '🤔',
        color: 'text-blue-600',
        bgColor: 'bg-blue-50 border-blue-200',
        needsSupport: false
      };
    default:
      return {
        label: 'Unknown',
        emoji: '❓',
        color: 'text-gray-600',
        bgColor: 'bg-gray-50 border-gray-200',
        needsSupport: false
      };
  }
};

/**
 * Check if there are consecutive negative check-ins (for safety alerts)
 * Accepts either an array of sentiment strings or objects with sentiment property
 */
export const checkConsecutiveNegatives = (
  checkIns: Array<string> | Array<{ sentiment: string }>,
  consecutiveCount: number = 3
): boolean => {
  if (checkIns.length < consecutiveCount) return false;
  
  // Get the last N check-ins
  const lastN = checkIns.slice(-consecutiveCount);
  
  // Check if all are negative - handle both string arrays and object arrays
  return lastN.every(c => {
    const sentiment = typeof c === 'string' ? c : c.sentiment;
    return sentiment === 'negative';
  });
};

/**
 * Compare user's mood selection with analyzed sentiment
 * Returns mood match info with scores for trend tracking
 */
export const compareSentimentWithEmoji = (
  selectedMood: string, // 'rough' | 'okay' | 'good' or 'happy' | 'neutral' | 'sad'
  sentimentResult: SentimentResult
): {
  matches: boolean;
  message: string;
  moodScore: number;
  textScore: number;
} => {
  // Map mood to score (0-10)
  const moodToScore: Record<string, number> = {
    'rough': 2,
    'sad': 2,
    'okay': 5,
    'neutral': 5,
    'good': 8,
    'happy': 8
  };

  // Map mood to expected sentiment
  const moodToSentiment: Record<string, string> = {
    'rough': 'negative',
    'sad': 'negative',
    'okay': 'neutral',
    'neutral': 'neutral',
    'good': 'positive',
    'happy': 'positive'
  };

  const moodScore = moodToScore[selectedMood] || 5;
  const textScore = sentimentToScore(sentimentResult);
  const expectedSentiment = moodToSentiment[selectedMood] || 'neutral';
  const analyzedSentiment = sentimentResult.sentiment;
  
  // Check for mismatch - significant divergence between mood and text
  if (analyzedSentiment === 'negative' && (selectedMood === 'good' || selectedMood === 'happy')) {
    return {
      matches: false,
      message: "Your words suggest you might be going through a difficult time, even if you're trying to stay positive. It's okay to acknowledge how you're really feeling. 💜",
      moodScore,
      textScore
    };
  }
  
  if (analyzedSentiment === 'positive' && (selectedMood === 'rough' || selectedMood === 'sad')) {
    return {
      matches: false,
      message: "It sounds like there might be some positivity in your message. Remember, it's okay to recognize the good moments too. 🌟",
      moodScore,
      textScore
    };
  }

  return { 
    matches: true, 
    message: 'Your words match how you feel',
    moodScore,
    textScore
  };
};
