import React from 'react';
import { ShieldCheck, Pill, Stethoscope, Apple, Moon, Cigarette, Coffee, AlertTriangle, Fish, Sparkles, CheckCircle2, XCircle } from 'lucide-react';
import { SpeakableText, SpeakButton } from './SpeakableText';

export const PreConceptionGuide: React.FC = () => {
  return (
    <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-100">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
          <ShieldCheck size={24} />
        </div>
        <div className="flex-1">
          <SpeakableText text="Pre-Conception Guide. Foundational Health and Preparation. Essential dos and crucial don'ts for preparing your body for pregnancy.">
            <h2 className="text-2xl font-bold font-display text-slate-900">Pre-Conception Guide</h2>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Foundational Health & Preparation</p>
          </SpeakableText>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* DO'S */}
        <div className="space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs font-bold uppercase tracking-wider">
            <CheckCircle2 size={14} />
            Essential Do's
          </div>

          <div className="space-y-4">
             {/* Item 1 */}
             <div className="bg-slate-50 rounded-2xl p-5 flex items-start gap-4 group">
               <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                 <Pill size={20} />
               </div>
               <div className="flex-1">
                 <h3 className="font-bold text-slate-900 text-sm">Start Folic Acid</h3>
                 <p className="text-xs text-slate-500 mt-1 leading-relaxed">Take 400mcg daily to prevent neural tube defects.</p>
               </div>
               <SpeakButton text="Start Folic Acid. Take 400 micrograms daily to prevent neural tube defects." size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
             </div>
             {/* Item 2 */}
             <div className="bg-slate-50 rounded-2xl p-5 flex items-start gap-4 group">
               <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                 <Stethoscope size={20} />
               </div>
               <div className="flex-1">
                 <h3 className="font-bold text-slate-900 text-sm">Pre-conception Checkup</h3>
                 <p className="text-xs text-slate-500 mt-1 leading-relaxed">Screen for underlying conditions and update vaccines.</p>
               </div>
               <SpeakButton text="Pre-conception Checkup. Screen for underlying conditions and update vaccines." size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
             </div>
             {/* Item 3 */}
             <div className="bg-slate-50 rounded-2xl p-5 flex items-start gap-4 group">
               <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                 <Apple size={20} />
               </div>
               <div className="flex-1">
                 <h3 className="font-bold text-slate-900 text-sm">Balanced Nutrition</h3>
                 <p className="text-xs text-slate-500 mt-1 leading-relaxed">Focus on leafy greens, lean protein, and whole grains.</p>
               </div>
               <SpeakButton text="Balanced Nutrition. Focus on leafy greens, lean protein, and whole grains." size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
             </div>
             {/* Item 4 */}
             <div className="bg-slate-50 rounded-2xl p-5 flex items-start gap-4 group">
               <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                 <Moon size={20} />
               </div>
               <div className="flex-1">
                 <h3 className="font-bold text-slate-900 text-sm">Regular Sleep</h3>
                 <p className="text-xs text-slate-500 mt-1 leading-relaxed">Regulate hormones with 7-9 hours of consistent rest.</p>
               </div>
               <SpeakButton text="Regular Sleep. Regulate hormones with 7 to 9 hours of consistent rest." size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
             </div>
          </div>
        </div>

        {/* DON'TS */}
        <div className="space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-rose-50 border border-rose-100 text-rose-700 text-xs font-bold uppercase tracking-wider">
            <XCircle size={14} />
            Crucial Don'ts
          </div>

          <div className="space-y-4">
             {/* Item 1 */}
             <div className="bg-slate-50 rounded-2xl p-5 flex items-start gap-4 group">
               <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                 <Cigarette size={20} />
               </div>
               <div className="flex-1">
                 <h3 className="font-bold text-slate-900 text-sm">Alcohol & Smoking</h3>
                 <p className="text-xs text-slate-500 mt-1 leading-relaxed">Both significantly reduce fertility and harm early development.</p>
               </div>
               <SpeakButton text="Avoid Alcohol and Smoking. Both significantly reduce fertility and harm early development." size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
             </div>
             {/* Item 2 */}
             <div className="bg-slate-50 rounded-2xl p-5 flex items-start gap-4 group">
               <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                 <Coffee size={20} />
               </div>
               <div className="flex-1">
                 <h3 className="font-bold text-slate-900 text-sm">Excessive Caffeine</h3>
                 <p className="text-xs text-slate-500 mt-1 leading-relaxed">Limit intake to under 200mg (about 1-2 cups of coffee) per day.</p>
               </div>
               <SpeakButton text="Avoid Excessive Caffeine. Limit intake to under 200 milligrams, about 1 to 2 cups of coffee per day." size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
             </div>
             {/* Item 3 */}
             <div className="bg-slate-50 rounded-2xl p-5 flex items-start gap-4 group">
               <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                 <AlertTriangle size={20} />
               </div>
               <div className="flex-1">
                 <h3 className="font-bold text-slate-900 text-sm">Self-Medication</h3>
                 <p className="text-xs text-slate-500 mt-1 leading-relaxed">Avoid over-the-counter drugs without consulting your OB-GYN.</p>
               </div>
               <SpeakButton text="Avoid Self-Medication. Avoid over-the-counter drugs without consulting your OB-GYN." size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
             </div>
             {/* Item 4 */}
             <div className="bg-slate-50 rounded-2xl p-5 flex items-start gap-4 group">
               <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                 <Fish size={20} />
               </div>
               <div className="flex-1">
                 <h3 className="font-bold text-slate-900 text-sm">High-Mercury Fish</h3>
                 <p className="text-xs text-slate-500 mt-1 leading-relaxed">Avoid shark, swordfish, and king mackerel during this phase.</p>
               </div>
               <SpeakButton text="Avoid High-Mercury Fish. Avoid shark, swordfish, and king mackerel during this phase." size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
             </div>
          </div>
        </div>
      </div>

      <div className="bg-indigo-50/50 border border-indigo-100 rounded-2xl p-4 flex items-center gap-4 text-indigo-900">
        <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center text-indigo-600 shrink-0">
          <Sparkles size={16} />
        </div>
        <SpeakableText text="Healthy habits established now can positively impact your baby's health for a lifetime. Start today!">
          <p className="text-xs sm:text-sm font-medium">Healthy habits established now can positively impact your baby's health for a lifetime. Start today!</p>
        </SpeakableText>
      </div>
    </div>
  );
};