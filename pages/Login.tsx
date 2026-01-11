import React, { useState } from 'react';
import { ArrowRight, Leaf, Heart, Stethoscope, Baby, Mail, Lock, User, CheckCircle2, Users, HeartHandshake, Eye, EyeOff, Globe } from 'lucide-react';
import { AppPhase, PHASE_CONFIG, UserRole } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';

interface LoginProps {
  onLogin: (phase: AppPhase, role: UserRole) => void;
}

export const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [selectedPhase, setSelectedPhase] = useState<AppPhase>('pre-pregnancy');
  const [selectedRole, setSelectedRole] = useState<UserRole>('mother');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  
  // Form fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const { signup, login, googleSignIn, resetPassword } = useAuth();
  const { language, setLanguage, supportedLanguages, languageName } = useLanguage();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    try {
      if (isSignUp) {
        await signup(email, password, displayName);
      } else {
        await login(email, password);
      }
      onLogin(selectedPhase, selectedRole);
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setIsLoading(true);
    try {
      await googleSignIn();
      onLogin(selectedPhase, selectedRole);
    } catch (err: any) {
      setError(err.message || 'Google sign-in failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      setError('Please enter your email address');
      return;
    }
    setError('');
    setSuccess('');
    setIsLoading(true);
    try {
      await resetPassword(email);
      setSuccess('Password reset email sent! Check your inbox.');
      setTimeout(() => setShowForgotPassword(false), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to send reset email');
    } finally {
      setIsLoading(false);
    }
  };

  const phases: { id: AppPhase; icon: any; description: string }[] = [
    { id: 'pre-pregnancy', icon: Leaf, description: 'Planning & preparing for conception' },
    { id: 'pregnancy', icon: Heart, description: 'Tracking growth & maternal health' },
    { id: 'post-partum', icon: Stethoscope, description: 'Recovery & newborn bonding' },
    { id: 'baby-care', icon: Baby, description: 'Milestones, feeding & sleep' },
  ];

  const roles: { id: UserRole; label: string; icon: any }[] = [
    { id: 'mother', label: 'Mother', icon: User },
    { id: 'partner', label: 'Partner', icon: Users },
    { id: 'family', label: 'Family', icon: HeartHandshake },
    { id: 'medical', label: 'Medical', icon: Stethoscope },
  ];

  return (
    <div className="min-h-screen bg-white flex flex-col lg:flex-row font-sans">
      
      {/* Left Side - Visuals */}
      <div className="lg:w-1/2 bg-slate-900 relative overflow-hidden flex flex-col justify-between p-8 lg:p-16 text-white min-h-[300px] lg:min-h-screen">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1555244162-803834f70033?q=80&w=2070&auto=format&fit=crop" 
            alt="Motherhood Journey" 
            className="w-full h-full object-cover opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent"></div>
        </div>
        
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center">
              <Leaf size={16} className="text-white" />
            </div>
            <span className="font-display font-bold text-lg tracking-tight">PreConceive</span>
          </div>
        </div>

        <div className="relative z-10 max-w-lg">
          <h1 className="text-4xl lg:text-5xl font-display font-extrabold mb-6 leading-tight">
            Your companion for every step of the journey.
          </h1>
          <p className="text-slate-300 text-lg leading-relaxed">
            From pre-conception nutrition to baby milestones, we provide the science-backed tools you need to thrive.
          </p>
        </div>
        
        <div className="relative z-10 hidden lg:flex gap-8 text-sm font-medium text-slate-400">
          <span>© 2024 PreConceive</span>
          <span>Privacy Policy</span>
          <span>Terms</span>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="lg:w-1/2 flex items-center justify-center p-6 lg:p-16 bg-white animate-in slide-in-from-right-4 duration-500">
        <div className="w-full max-w-md">
          
          {/* Language Selector */}
          <div className="flex justify-end mb-4">
            <div className="relative">
              <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 rounded-xl border border-slate-200">
                <Globe size={16} className="text-slate-500" />
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="bg-transparent text-sm font-medium text-slate-700 focus:outline-none cursor-pointer pr-6"
                >
                  {supportedLanguages.map((lang) => (
                    <option key={lang.code} value={lang.code}>
                      {lang.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="text-center mb-8">
            <h2 className="text-3xl font-display font-bold text-slate-900 mb-2">
              {isSignUp ? 'Create an account' : 'Welcome back'}
            </h2>
            <p className="text-slate-500">
              Enter your details to access your dashboard.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
                {error}
              </div>
            )}

            {success && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl text-sm">
                {success}
              </div>
            )}

             {/* Role Selection */}
             <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 text-center">I am the...</label>
                <div className="grid grid-cols-4 gap-2">
                  {roles.map((r) => {
                    const isActive = selectedRole === r.id;
                    const Icon = r.icon;
                    return (
                      <button
                        key={r.id}
                        type="button"
                        onClick={() => setSelectedRole(r.id)}
                        className={`
                          flex flex-col items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all
                          ${isActive 
                            ? 'border-slate-900 bg-slate-50 text-slate-900' 
                            : 'border-slate-100 bg-white text-slate-400 hover:border-slate-200 hover:text-slate-600'}
                        `}
                      >
                        <Icon size={20} className={isActive ? 'text-slate-900' : 'text-slate-400'} />
                        <span className="text-[10px] font-bold uppercase tracking-wide">{r.label}</span>
                      </button>
                    );
                  })}
                </div>
             </div>
            
            {/* Sign Up Specific Fields */}
            {isSignUp && (
              <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 pt-2 border-t border-slate-100">
                <div>
                   <label className="block text-sm font-bold text-slate-700 mb-1.5">Full Name</label>
                   <div className="relative">
                     <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                     <input 
                       type="text" 
                       value={displayName}
                       onChange={(e) => setDisplayName(e.target.value)}
                       className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-10 pr-4 text-slate-900 focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none transition-all" 
                       placeholder="Sarah Jenkins" 
                       required={isSignUp}
                     />
                   </div>
                </div>

                {/* Phase Selection Grid */}
                <div>
                   <label className="block text-sm font-bold text-slate-700 mb-3">Current Journey Phase</label>
                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                     {phases.map((p) => (
                       <div 
                         key={p.id}
                         onClick={() => setSelectedPhase(p.id)}
                         className={`cursor-pointer rounded-xl p-3 border-2 transition-all flex flex-col gap-2 relative overflow-hidden
                           ${selectedPhase === p.id 
                             ? `border-${PHASE_CONFIG[p.id].theme}-500 bg-${PHASE_CONFIG[p.id].theme}-50` 
                             : 'border-slate-100 bg-white hover:border-slate-200'}
                         `}
                       >
                         {selectedPhase === p.id && (
                           <div className={`absolute top-2 right-2 text-${PHASE_CONFIG[p.id].theme}-600`}>
                             <CheckCircle2 size={16} />
                           </div>
                         )}
                         <div className={`
                           w-8 h-8 rounded-lg flex items-center justify-center
                           ${selectedPhase === p.id ? `bg-${PHASE_CONFIG[p.id].theme}-200 text-${PHASE_CONFIG[p.id].theme}-700` : 'bg-slate-100 text-slate-400'}
                         `}>
                           <p.icon size={16} />
                         </div>
                         <div>
                            <span className={`block text-xs font-bold ${selectedPhase === p.id ? 'text-slate-900' : 'text-slate-600'}`}>{PHASE_CONFIG[p.id].label}</span>
                         </div>
                       </div>
                     ))}
                   </div>
                </div>
              </div>
            )}

            {/* Common Fields */}
            <div className="space-y-4">
              <div>
                 <label className="block text-sm font-bold text-slate-700 mb-1.5">Email Address</label>
                 <div className="relative">
                   <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                   <input 
                     type="email" 
                     value={email}
                     onChange={(e) => setEmail(e.target.value)}
                     className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-10 pr-4 text-slate-900 focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none transition-all" 
                     placeholder="sarah@example.com" 
                     required
                   />
                 </div>
              </div>

              <div>
                 <label className="block text-sm font-bold text-slate-700 mb-1.5">Password</label>
                 <div className="relative">
                   <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                   <input 
                     type={showPassword ? "text" : "password"} 
                     value={password}
                     onChange={(e) => setPassword(e.target.value)}
                     className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-10 pr-12 text-slate-900 focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none transition-all" 
                     placeholder="••••••••" 
                     required
                     minLength={6}
                   />
                   <button
                     type="button"
                     onClick={() => setShowPassword(!showPassword)}
                     className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                   >
                     {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                   </button>
                 </div>
                 {!isSignUp && (
                   <button
                     type="button"
                     onClick={() => setShowForgotPassword(true)}
                     className="mt-2 text-sm text-slate-600 hover:text-slate-900 font-medium"
                   >
                     Forgot password?
                   </button>
                 )}
              </div>
            </div>

            <button 
              disabled={isLoading}
              className={`
                w-full bg-slate-900 text-white font-bold py-4 rounded-xl shadow-lg shadow-slate-900/20 hover:bg-slate-800 transition-all flex items-center justify-center gap-2 group
                ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}
              `}
            >
              {isLoading ? (
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
              ) : (
                <>
                  {isSignUp ? 'Start My Journey' : 'Sign In'}
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>

          </form>

          {/* Google Sign In */}
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-slate-500">Or continue with</span>
              </div>
            </div>

            <button 
              type="button"
              onClick={handleGoogleSignIn}
              disabled={isLoading}
              className="mt-4 w-full bg-white border-2 border-slate-200 text-slate-700 font-bold py-3 rounded-xl hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Sign in with Google
            </button>
          </div>

          <div className="mt-8 text-center">
            <p className="text-slate-500 text-sm">
              {isSignUp ? "Already have an account?" : "Don't have an account yet?"}{' '}
              <button 
                onClick={() => setIsSignUp(!isSignUp)}
                className="font-bold text-slate-900 hover:underline"
              >
                {isSignUp ? 'Log in' : 'Sign up'}
              </button>
            </p>
          </div>

        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotPassword && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl">
            <h3 className="text-xl font-bold text-slate-900 mb-2">Reset Password</h3>
            <p className="text-slate-600 text-sm mb-4">
              Enter your email address and we'll send you a link to reset your password.
            </p>
            
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm mb-4">
                {error}
              </div>
            )}
            
            {success && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl text-sm mb-4">
                {success}
              </div>
            )}
            
            <div className="mb-4">
              <label className="block text-sm font-bold text-slate-700 mb-1.5">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-10 pr-4 text-slate-900 focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none transition-all" 
                  placeholder="sarah@example.com" 
                />
              </div>
            </div>
            
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setShowForgotPassword(false);
                  setError('');
                  setSuccess('');
                }}
                className="flex-1 bg-slate-100 text-slate-700 font-bold py-3 rounded-xl hover:bg-slate-200 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleForgotPassword}
                disabled={isLoading}
                className="flex-1 bg-slate-900 text-white font-bold py-3 rounded-xl hover:bg-slate-800 transition-all disabled:opacity-70"
              >
                {isLoading ? 'Sending...' : 'Send Reset Link'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};