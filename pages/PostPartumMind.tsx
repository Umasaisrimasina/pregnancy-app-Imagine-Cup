import React, { useState, useRef, useEffect } from 'react';
import { ResponsiveContainer, AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ReferenceLine } from 'recharts';
import { Smile, Frown, Meh, Lock, Mic, ArrowRight, X, Send, Shield, Activity, Heart, AlertCircle, CheckCircle2, Sparkles, Globe, TrendingDown, TrendingUp, Minus } from 'lucide-react';
import { AppPhase } from '../types';
import { SpeakableText, SpeakButton } from '../components/SpeakableText';
import { useLanguage } from '../contexts/LanguageContext';
import { analyzeSentiment, compareSentimentWithEmoji, sentimentToScore, checkConsecutiveNegatives, SentimentResult } from '../services/sentimentService';

interface PageProps {
  phase: AppPhase;
}

// Interface for daily check-in entries
interface DailyCheckIn {
  id: string;
  date: Date;
  selectedMood: string; // 'rough' | 'okay' | 'good'
  journalText: string;
  factors: string[];
  textSentiment?: SentimentResult;
  moodMatch?: {
    matches: boolean;
    message: string;
    moodScore: number;
    textScore: number;
  };
}

// Sample check-in history with sentiment data
const sampleCheckIns: DailyCheckIn[] = [
  {
    id: '1',
    date: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
    selectedMood: 'okay',
    journalText: 'Feeling tired but managing. The baby slept a bit better last night.',
    factors: ['Sleep', 'My Body'],
    textSentiment: { sentiment: 'mixed', confidenceScores: { positive: 0.45, neutral: 0.35, negative: 0.2 } },
    moodMatch: { matches: true, message: 'Your words match how you feel', moodScore: 5, textScore: 5.5 }
  },
  {
    id: '2',
    date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    selectedMood: 'rough',
    journalText: 'Overwhelmed with everything. I feel so exhausted and alone.',
    factors: ['Sleep', 'Family'],
    textSentiment: { sentiment: 'negative', confidenceScores: { positive: 0.1, neutral: 0.15, negative: 0.75 } },
    moodMatch: { matches: true, message: 'Your words match how you feel', moodScore: 2, textScore: 2.5 }
  },
  {
    id: '3',
    date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
    selectedMood: 'good',
    journalText: 'Had a lovely visit from my mom. She helped so much with the baby!',
    factors: ['Family'],
    textSentiment: { sentiment: 'positive', confidenceScores: { positive: 0.85, neutral: 0.12, negative: 0.03 } },
    moodMatch: { matches: true, message: 'Your words match how you feel', moodScore: 8, textScore: 8.2 }
  },
  {
    id: '4',
    date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    selectedMood: 'good',
    journalText: 'Feeling hopeful today. Baby smiled at me for the first time!',
    factors: ['Family'],
    textSentiment: { sentiment: 'positive', confidenceScores: { positive: 0.9, neutral: 0.08, negative: 0.02 } },
    moodMatch: { matches: true, message: 'Your words match how you feel', moodScore: 8, textScore: 8.8 }
  },
  {
    id: '5',
    date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    selectedMood: 'okay',
    journalText: 'Trying to take things one day at a time. Some moments are hard.',
    factors: ['My Body', 'Sleep'],
    textSentiment: { sentiment: 'mixed', confidenceScores: { positive: 0.35, neutral: 0.4, negative: 0.25 } },
    moodMatch: { matches: true, message: 'Your words match how you feel', moodScore: 5, textScore: 4.5 }
  },
  {
    id: '6',
    date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    selectedMood: 'rough',
    journalText: 'Not a good day. Baby was fussy all night and I feel like crying.',
    factors: ['Sleep', 'My Body'],
    textSentiment: { sentiment: 'negative', confidenceScores: { positive: 0.08, neutral: 0.2, negative: 0.72 } },
    moodMatch: { matches: true, message: 'Your words match how you feel', moodScore: 2, textScore: 2.8 }
  }
];

// Generate mood trend data from check-ins
const generateMoodTrendData = (checkIns: DailyCheckIn[]) => {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  return checkIns.map((checkIn, index) => ({
    day: days[checkIn.date.getDay()],
    moodValue: checkIn.moodMatch?.moodScore || 5,
    textValue: checkIn.moodMatch?.textScore || 5,
    sentiment: checkIn.textSentiment?.sentiment || 'neutral'
  }));
};

const moodTrendData = generateMoodTrendData(sampleCheckIns);

const screeningHistoryData = [
  { month: 'Sep', score: 8 },
  { month: 'Oct', score: 12 },
  { month: 'Nov', score: 6 },
  { month: 'Dec', score: 9 },
  { month: 'Jan', score: 5 },
];

const epdsQuestions = [
  {
    id: 1,
    question: "I have been able to laugh and see the funny side of things",
    options: ["As much as I always could", "Not quite so much now", "Definitely not so much now", "Not at all"]
  },
  {
    id: 2,
    question: "I have looked forward with enjoyment to things",
    options: ["As much as I ever did", "Rather less than I used to", "Definitely less than I used to", "Hardly at all"]
  },
  {
    id: 3,
    question: "I have blamed myself unnecessarily when things went wrong",
    options: ["No, never", "Not very often", "Yes, some of the time", "Yes, most of the time"]
  },
  {
    id: 4,
    question: "I have been anxious or worried for no good reason",
    options: ["No, not at all", "Hardly ever", "Yes, sometimes", "Yes, very often"]
  },
  {
    id: 5,
    question: "I have felt scared or panicky for no very good reason",
    options: ["No, not at all", "No, not much", "Yes, sometimes", "Yes, quite a lot"]
  },
  {
    id: 6,
    question: "Things have been getting on top of me",
    options: ["No, I've been coping as well as ever", "No, most of the time I cope well", "Yes, sometimes I haven't been coping", "Yes, most of the time I can't cope"]
  },
  {
    id: 7,
    question: "I have been so unhappy that I have had difficulty sleeping",
    options: ["No, not at all", "Not very often", "Yes, sometimes", "Yes, most of the time"]
  },
  {
    id: 8,
    question: "I have felt sad or miserable",
    options: ["No, not at all", "Not very often", "Yes, quite often", "Yes, most of the time"]
  },
  {
    id: 9,
    question: "I have been so unhappy that I have been crying",
    options: ["No, never", "Only occasionally", "Yes, quite often", "Yes, most of the time"]
  },
  {
    id: 10,
    question: "The thought of harming myself has occurred to me",
    options: ["Never", "Hardly ever", "Sometimes", "Yes, quite often"]
  }
];

export const PostPartumMind: React.FC<PageProps> = ({ phase }) => {
  const { language, setLanguage, supportedLanguages } = useLanguage();
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [selectedMood, setSelectedMood] = useState<string>('good');
  const [selectedFactors, setSelectedFactors] = useState<string[]>(['My Body']);
  const [messages, setMessages] = useState([
    { id: 1, sender: 'ai', text: "Welcome to your safe space. How are you feeling today, mama?" }
  ]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // EPDS State
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [screeningComplete, setScreeningComplete] = useState(false);

  // Sentiment Analysis State
  const [journalText, setJournalText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [liveSentiment, setLiveSentiment] = useState<SentimentResult | null>(null);
  const [checkIns, setCheckIns] = useState<DailyCheckIn[]>(sampleCheckIns);
  const [lastSaveResult, setLastSaveResult] = useState<{ success: boolean; moodMatch?: DailyCheckIn['moodMatch'] } | null>(null);

  // Check for consecutive negative entries
  const hasConsecutiveNegatives = checkConsecutiveNegatives(checkIns.map(c => c.textSentiment?.sentiment || 'neutral'));

  // Debounced sentiment analysis for journal input
  useEffect(() => {
    if (journalText.length < 10) {
      setLiveSentiment(null);
      return;
    }

    const timer = setTimeout(async () => {
      const result = await analyzeSentiment(journalText);
      setLiveSentiment(result);
    }, 500);

    return () => clearTimeout(timer);
  }, [journalText]);

  // Handle saving check-in with sentiment analysis
  const handleSaveCheckIn = async () => {
    if (!journalText.trim()) return;

    setIsAnalyzing(true);
    try {
      const sentimentResult = await analyzeSentiment(journalText);
      const moodMatch = compareSentimentWithEmoji(selectedMood, sentimentResult);

      const newCheckIn: DailyCheckIn = {
        id: Date.now().toString(),
        date: new Date(),
        selectedMood,
        journalText,
        factors: selectedFactors,
        textSentiment: sentimentResult,
        moodMatch
      };

      setCheckIns(prev => [...prev, newCheckIn]);
      setLastSaveResult({ success: true, moodMatch });
      setJournalText('');
      setLiveSentiment(null);

      // Clear success message after 5 seconds
      setTimeout(() => setLastSaveResult(null), 5000);
    } catch (error) {
      console.error('Error saving check-in:', error);
      setLastSaveResult({ success: false });
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Get mood trend data from current check-ins
  const currentMoodTrendData = generateMoodTrendData(checkIns.slice(-7));

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isChatOpen]);

  const handleSend = () => {
    if (!inputValue.trim()) return;
    
    const newUserMsg = { id: Date.now(), sender: 'user', text: inputValue };
    setMessages(prev => [...prev, newUserMsg]);
    setInputValue('');

    setTimeout(() => {
      setMessages(prev => [...prev, { 
        id: Date.now() + 1, 
        sender: 'ai', 
        text: "Thank you for sharing. It takes courage to express these feelings. Remember, your emotions are valid, and recovery takes time. Would you like to explore some coping strategies together?" 
      }]);
    }, 1000);
  };

  const handleAnswerSelect = (optionIndex: number) => {
    const newAnswers = [...answers, optionIndex];
    setAnswers(newAnswers);
    
    if (currentQuestion < epdsQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      setShowResults(true);
      setScreeningComplete(true);
    }
  };

  const totalScore = answers.reduce((sum, answer) => sum + answer, 0);
  const isHighRisk = totalScore >= 10;

  const resetScreening = () => {
    setCurrentQuestion(0);
    setAnswers([]);
    setShowResults(false);
  };

  const toggleFactor = (factor: string) => {
    setSelectedFactors(prev => 
      prev.includes(factor) 
        ? prev.filter(f => f !== factor)
        : [...prev, factor]
    );
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 relative">
      
      {/* Language Selector */}
      <div className="flex justify-end">
        <div className="flex items-center gap-2 px-3 py-2 bg-white rounded-xl border border-slate-200 shadow-sm">
          <Globe size={16} className="text-slate-500" />
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="bg-transparent text-sm font-medium text-slate-700 focus:outline-none cursor-pointer"
          >
            {supportedLanguages.map((lang) => (
              <option key={lang.code} value={lang.code}>
                {lang.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Motivational Quote - Centered */}
      <div className="flex flex-col items-center justify-center text-center py-16 bg-slate-50/50 rounded-[2rem] my-4">
        <Heart size={40} className="text-purple-400 mb-6" />
        <SpeakableText text="Healing takes time, and that's okay. You're doing an incredible job.">
          <p className="font-serif italic text-3xl md:text-4xl lg:text-5xl text-slate-800 leading-relaxed max-w-4xl px-8" style={{ fontFamily: "'DM Serif Display', serif" }}>
            Healing takes time, and that's okay. You're doing an incredible job.
          </p>
        </SpeakableText>
      </div>

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <SpeakableText text="Stress and Mind. Your postpartum mental wellness companion.">
            <h1 className="text-3xl font-display font-extrabold text-slate-900">Stress & Mind</h1>
            <p className="text-slate-500 mt-1">Your postpartum mental wellness companion.</p>
          </SpeakableText>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column - Daily Check-In & Mood Trends */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          
          {/* Daily Check-In Card */}
          <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-100 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-purple-100 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none opacity-60"></div>
            
            <div className="relative z-10">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-xl font-bold font-display text-slate-900">Daily Check-In</h2>
                <span className="text-xs font-medium text-slate-400 bg-slate-50 px-3 py-1 rounded-full">Today</span>
              </div>

              {/* Mood Selector */}
              <div className="flex justify-between max-w-md mx-auto mb-10">
                {[
                  { id: 'rough', icon: Frown, label: 'Rough', color: 'bg-red-100 text-red-500', activeRing: 'ring-red-200' },
                  { id: 'okay', icon: Meh, label: 'Okay', color: 'bg-slate-100 text-slate-500', activeRing: 'ring-slate-200' },
                  { id: 'good', icon: Smile, label: 'Good', color: 'bg-purple-100 text-purple-600', activeRing: 'ring-purple-200' },
                ].map((item) => (
                   <div 
                     key={item.id} 
                     className="flex flex-col items-center gap-2 cursor-pointer group"
                     onClick={() => setSelectedMood(item.id)}
                   >
                     <div className={`
                       w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300
                       ${selectedMood === item.id 
                         ? `${item.color} scale-110 shadow-lg ring-4 ${item.activeRing}` 
                         : 'bg-slate-50 text-slate-300 hover:bg-slate-100'}
                     `}>
                       <item.icon size={32} />
                     </div>
                     <span className={`text-xs font-bold ${selectedMood === item.id ? 'text-slate-900' : 'text-slate-400'}`}>
                       {item.label}
                     </span>
                   </div>
                ))}
              </div>

              {/* Affecting Factors */}
              <div className="mb-8">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 block">What's affecting you?</label>
                <div className="flex flex-wrap gap-2">
                  {['Sleep', 'Work', 'Family', 'My Body', 'Diet'].map((tag) => (
                    <button 
                      key={tag} 
                      onClick={() => toggleFactor(tag)}
                      className={`px-4 py-2 rounded-full text-sm border transition-colors ${
                        selectedFactors.includes(tag) 
                          ? 'bg-purple-50 border-purple-200 text-purple-700 font-medium' 
                          : 'border-slate-200 text-slate-600 hover:border-purple-200'
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>

              {/* Journal Input with Live Sentiment */}
              <div className="relative">
                <textarea 
                  className="w-full h-32 bg-slate-50 border-0 rounded-2xl p-5 text-slate-700 resize-none focus:ring-2 focus:ring-purple-200 placeholder:text-slate-400 text-sm leading-relaxed"
                  placeholder="Write as much or as little as you need..."
                  value={journalText}
                  onChange={(e) => setJournalText(e.target.value)}
                  disabled={isAnalyzing}
                ></textarea>
                <button className="absolute bottom-4 right-4 p-2 bg-white rounded-full shadow-sm text-slate-400 hover:text-purple-600">
                  <Mic size={20} />
                </button>
              </div>

              {/* Live Sentiment Preview */}
              {liveSentiment && journalText.length >= 10 && (
                <div className={`mt-4 p-4 rounded-xl border ${
                  liveSentiment.sentiment === 'positive' ? 'bg-green-50 border-green-200' :
                  liveSentiment.sentiment === 'negative' ? 'bg-red-50 border-red-200' :
                  'bg-slate-50 border-slate-200'
                }`}>
                  <div className="flex items-center gap-2">
                    {liveSentiment.sentiment === 'positive' ? (
                      <TrendingUp size={16} className="text-green-600" />
                    ) : liveSentiment.sentiment === 'negative' ? (
                      <TrendingDown size={16} className="text-red-600" />
                    ) : (
                      <Minus size={16} className="text-slate-500" />
                    )}
                    <span className="text-xs font-medium capitalize">
                      Detected tone: <strong>{liveSentiment.sentiment}</strong>
                    </span>
                    <span className="text-xs text-slate-400">
                      ({Math.round(Math.max(liveSentiment.confidenceScores.positive, liveSentiment.confidenceScores.neutral, liveSentiment.confidenceScores.negative) * 100)}% confident)
                    </span>
                  </div>
                </div>
              )}

              {/* Success/Mismatch Feedback */}
              {lastSaveResult && (
                <div className={`mt-4 p-4 rounded-xl ${
                  lastSaveResult.moodMatch?.matches 
                    ? 'bg-green-50 border border-green-200' 
                    : 'bg-amber-50 border border-amber-200'
                }`}>
                  {lastSaveResult.moodMatch?.matches ? (
                    <div className="flex items-center gap-2 text-green-700">
                      <CheckCircle2 size={18} />
                      <span className="text-sm font-medium">Entry saved! Your words align with how you feel. 💚</span>
                    </div>
                  ) : (
                    <div className="text-amber-700">
                      <div className="flex items-center gap-2 mb-2">
                        <AlertCircle size={18} />
                        <span className="text-sm font-medium">{lastSaveResult.moodMatch?.message}</span>
                      </div>
                      <p className="text-xs">
                        It's okay if there's a mismatch — sometimes our words reveal feelings we haven't fully acknowledged yet. 
                        Would you like to talk to someone about how you're feeling?
                      </p>
                    </div>
                  )}
                </div>
              )}

              <div className="mt-6 flex justify-end">
                <button 
                  onClick={handleSaveCheckIn}
                  disabled={isAnalyzing || !journalText.trim()}
                  className={`px-8 py-3 rounded-xl font-bold text-sm shadow-lg transition-colors ${
                    isAnalyzing || !journalText.trim()
                      ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                      : 'bg-purple-600 text-white shadow-purple-600/20 hover:bg-purple-700'
                  }`}
                >
                  {isAnalyzing ? 'Analyzing...' : 'Save Entry'}
                </button>
              </div>
            </div>
          </div>

          {/* Consecutive Negative Alert */}
          {hasConsecutiveNegatives && (
            <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-[2rem] p-6 shadow-sm border border-red-200">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                  <AlertCircle size={24} className="text-red-600" />
                </div>
                <div>
                  <h3 className="font-bold text-red-800 mb-1">We're here for you 💕</h3>
                  <p className="text-sm text-red-700 mb-3">
                    We've noticed you've been having a difficult few days. It's okay to ask for help — you don't have to go through this alone.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <button className="px-4 py-2 bg-white border border-red-200 rounded-lg text-sm font-medium text-red-700 hover:bg-red-50">
                      Talk to a Counselor
                    </button>
                    <button className="px-4 py-2 bg-red-600 rounded-lg text-sm font-medium text-white hover:bg-red-700">
                      Crisis Resources
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Mood Trends Chart - Enhanced with Dual Lines */}
          <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-100">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-100 to-indigo-100 flex items-center justify-center">
                  <Activity size={20} className="text-purple-600" />
                </div>
                <h2 className="text-lg font-bold font-display text-slate-900">Mood Trends</h2>
              </div>
              <span className="text-xs font-bold text-purple-600 bg-purple-50 px-2 py-1 rounded-md">
                This Week
              </span>
            </div>
            
            {/* Enhanced dual-line chart comparing selected mood vs text sentiment */}
            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={currentMoodTrendData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorMoodPurple" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorTextBlue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis 
                    dataKey="day" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#94a3b8', fontSize: 12 }} 
                  />
                  <YAxis hide domain={[0, 10]} />
                  <ReferenceLine y={5} stroke="#e2e8f0" strokeDasharray="3 3" />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)' }}
                    formatter={(value: number, name: string) => [
                      `${value.toFixed(1)}/10`,
                      name === 'moodValue' ? 'Selected Mood' : 'Text Sentiment'
                    ]}
                  />
                  {/* Selected Mood Line (purple) */}
                  <Area 
                    type="monotone" 
                    dataKey="moodValue"
                    name="moodValue"
                    stroke="#8b5cf6" 
                    strokeWidth={3}
                    fill="url(#colorMoodPurple)" 
                    dot={{ r: 4, fill: "#ffffff", stroke: "#8b5cf6", strokeWidth: 2 }}
                    activeDot={{ r: 6, fill: "#8b5cf6", stroke: "#ffffff", strokeWidth: 2 }}
                  />
                  {/* Text Sentiment Line (blue) */}
                  <Area 
                    type="monotone" 
                    dataKey="textValue"
                    name="textValue"
                    stroke="#3b82f6" 
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    fill="url(#colorTextBlue)" 
                    dot={{ r: 3, fill: "#ffffff", stroke: "#3b82f6", strokeWidth: 2 }}
                    activeDot={{ r: 5, fill: "#3b82f6", stroke: "#ffffff", strokeWidth: 2 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            
            <div className="flex justify-center gap-6 mt-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-1 rounded-full bg-purple-500"></div>
                <span className="text-xs font-medium text-slate-500">Selected Mood</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-1 rounded-full bg-blue-500" style={{ background: 'repeating-linear-gradient(90deg, #3b82f6, #3b82f6 4px, transparent 4px, transparent 8px)' }}></div>
                <span className="text-xs font-medium text-slate-500">Text Sentiment</span>
              </div>
            </div>
            
            <p className="text-xs text-center text-slate-400 mt-3">
              When the lines diverge, your words may reveal feelings you haven't fully acknowledged
            </p>
          </div>
        </div>

        {/* Right Column - EPDS Screening & History */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          
          {/* EPDS Clinical Wellness Screening */}
          <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-[2rem] p-8 shadow-sm border border-purple-100 relative overflow-hidden">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center">
                <Sparkles size={24} className="text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold font-display text-slate-900">EPDS Wellness Screening</h2>
                <p className="text-xs text-slate-500">Edinburgh Postnatal Depression Scale</p>
              </div>
            </div>

            {!showResults ? (
              <>
                {/* Progress Bar */}
                <div className="mb-6">
                  <div className="flex justify-between text-xs font-medium text-slate-500 mb-2">
                    <span>Question {currentQuestion + 1} of {epdsQuestions.length}</span>
                    <span>{Math.round(((currentQuestion) / epdsQuestions.length) * 100)}% Complete</span>
                  </div>
                  <div className="h-2 bg-white rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 transition-all duration-300"
                      style={{ width: `${(currentQuestion / epdsQuestions.length) * 100}%` }}
                    ></div>
                  </div>
                </div>

                {/* Current Question */}
                <div className="bg-white rounded-2xl p-6 mb-4">
                  <p className="text-sm font-medium text-slate-700 mb-4 leading-relaxed">
                    {epdsQuestions[currentQuestion].question}
                  </p>
                  <div className="space-y-2">
                    {epdsQuestions[currentQuestion].options.map((option, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleAnswerSelect(idx)}
                        className="w-full text-left p-3 rounded-xl border border-slate-100 text-sm text-slate-600 hover:border-purple-300 hover:bg-purple-50 transition-all"
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              /* Results */
              <div className="bg-white rounded-2xl p-6">
                <div className="text-center mb-6">
                  <div className={`w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center ${
                    isHighRisk ? 'bg-red-100' : 'bg-purple-100'
                  }`}>
                    {isHighRisk ? (
                      <AlertCircle size={32} className="text-red-500" />
                    ) : (
                      <Heart size={32} className="text-purple-500" />
                    )}
                  </div>
                  <h3 className="font-bold text-slate-900 text-lg mb-2">
                    Your Score: {totalScore}/30
                  </h3>
                  <span className={`inline-block px-4 py-1 rounded-full text-sm font-bold ${
                    isHighRisk 
                      ? 'bg-red-100 text-red-700' 
                      : 'bg-purple-100 text-purple-700'
                  }`}>
                    {isHighRisk ? 'Elevated Risk' : 'Low Risk'}
                  </span>
                </div>

                {isHighRisk ? (
                  <div className="bg-red-50 rounded-xl p-4 mb-4">
                    <p className="text-sm text-red-800 font-medium mb-3">
                      Your responses suggest you may benefit from additional support. Please consider reaching out to a healthcare provider.
                    </p>
                    <div className="space-y-2 text-xs">
                      <p className="font-bold text-red-700">Crisis Resources:</p>
                      <p className="text-red-600">• iCall: 9152987821</p>
                      <p className="text-red-600">• Vandrevala Foundation: 1860-2662-345</p>
                    </div>
                  </div>
                ) : (
                  <div className="bg-purple-50 rounded-xl p-4 mb-4">
                    <p className="text-sm text-purple-800">
                      Your score suggests you're coping well. Continue monitoring your mood and reach out if things change.
                    </p>
                  </div>
                )}

                <button 
                  onClick={resetScreening}
                  className="w-full text-center text-purple-600 font-bold text-sm hover:text-purple-700"
                >
                  Retake Screening
                </button>
              </div>
            )}
          </div>

          {/* Screening History */}
          <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-100">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold font-display text-slate-900">Screening History</h2>
            </div>
            
            <div className="h-40 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={screeningHistoryData}>
                  <XAxis 
                    dataKey="month" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#94a3b8', fontSize: 11 }} 
                  />
                  <YAxis hide domain={[0, 20]} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                  />
                  <Bar 
                    dataKey="score" 
                    fill="#8b5cf6" 
                    radius={[4, 4, 4, 4]} 
                    barSize={28}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
            
            <div className="flex justify-center gap-6 mt-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-purple-200"></div>
                <span className="text-xs font-medium text-slate-500">Low (0-9)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-red-200"></div>
                <span className="text-xs font-medium text-slate-500">High (10+)</span>
              </div>
            </div>
          </div>

          {/* Silent Chat AI Promo */}
          <div 
            onClick={() => setIsChatOpen(true)}
            className="bg-slate-900 rounded-[2rem] p-8 text-white relative overflow-hidden group cursor-pointer shadow-xl shadow-slate-900/10 hover:shadow-slate-900/20 transition-all"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500 rounded-full blur-[60px] opacity-20"></div>
            
            <div className="relative z-10">
               <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center mb-4 backdrop-blur-sm">
                 <Lock size={20} className="text-purple-300" />
               </div>
               <h3 className="text-lg font-bold font-display mb-2">Silent Chat</h3>
               <p className="text-slate-400 text-sm mb-6 leading-relaxed">
                 Need to vent in a safe, anonymous space? Our AI companion is here to listen without judgment.
               </p>
               
               <div className="flex items-center gap-2 text-sm font-bold text-purple-300 group-hover:text-purple-200 transition-colors">
                 Start Secure Session <ArrowRight size={16} />
               </div>
            </div>
          </div>

        </div>
      </div>

      {/* Chat Popup Modal */}
      {isChatOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div 
             className="bg-white w-full max-w-md h-[600px] rounded-[2rem] shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200"
             onClick={(e) => e.stopPropagation()}
          >
             {/* Chat Header */}
             <div className="bg-slate-900 p-6 flex items-center justify-between text-white shrink-0">
                <div className="flex items-center gap-3">
                   <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center border border-slate-700">
                     <Lock size={18} className="text-purple-400" />
                   </div>
                   <div>
                     <h3 className="font-bold font-display">Silent Chat</h3>
                     <div className="flex items-center gap-1.5 opacity-80">
                       <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse"></span>
                       <span className="text-[10px] font-bold uppercase tracking-wider">Secure & Encrypted</span>
                     </div>
                   </div>
                </div>
                <button 
                  onClick={(e) => { e.stopPropagation(); setIsChatOpen(false); }}
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                >
                  <X size={18} />
                </button>
             </div>

             {/* Messages */}
             <div className="flex-1 bg-slate-50 p-6 overflow-y-auto space-y-4">
               {messages.map((msg) => (
                 <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                   <div className={`
                     max-w-[85%] p-4 rounded-2xl text-sm leading-relaxed
                     ${msg.sender === 'user' 
                       ? 'bg-slate-900 text-white rounded-tr-none shadow-md shadow-slate-900/10' 
                       : 'bg-white text-slate-700 border border-slate-100 rounded-tl-none shadow-sm'}
                   `}>
                     {msg.text}
                   </div>
                 </div>
               ))}
               <div ref={messagesEndRef} />
             </div>

             {/* Input Area */}
             <div className="p-4 bg-white border-t border-slate-100 shrink-0">
               <div className="relative flex items-center gap-2">
                 <input 
                   type="text" 
                   value={inputValue}
                   onChange={(e) => setInputValue(e.target.value)}
                   onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                   placeholder="Type your thoughts..."
                   className="flex-1 bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 rounded-xl py-3.5 pl-4 pr-12 focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all"
                   autoFocus
                 />
                 <button 
                   onClick={handleSend}
                   disabled={!inputValue.trim()}
                   className="absolute right-2 p-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
                 >
                   <Send size={16} />
                 </button>
               </div>
               <p className="text-center text-[10px] text-slate-400 mt-3 flex items-center justify-center gap-1.5">
                 <Shield size={10} />
                 Conversations are anonymous and not stored permanently.
               </p>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};
