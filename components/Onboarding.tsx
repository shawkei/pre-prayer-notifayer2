import React from 'react';
import { Bell, MapPin, Clock, ArrowRight, Sun, ArrowLeft } from 'lucide-react';
import { translations, Language } from '../translations';

interface Props {
  onComplete: () => void;
  lang: Language;
}

export const Onboarding: React.FC<Props> = ({ onComplete, lang }) => {
  const t = translations[lang];
  const isRTL = lang === 'ar';

  return (
    <div className="flex flex-col h-full bg-white relative overflow-hidden" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-full h-1/2 bg-gradient-to-b from-emerald-50 to-white"></div>
      <div className="absolute -top-20 -right-20 w-80 h-80 bg-emerald-100/50 rounded-full blur-[80px]"></div>
      
      <div className="flex-1 flex flex-col justify-center items-center px-8 z-10 animate-fade-in-up">
        
        {/* Main Icon */}
        <div className="mb-10 relative">
           <div className="absolute inset-0 bg-emerald-200/40 blur-2xl rounded-full animate-pulse-slow"></div>
           <div className="w-24 h-24 bg-white rounded-3xl rotate-3 flex items-center justify-center shadow-xl shadow-emerald-100 border border-emerald-50 relative">
              <Sun className="w-10 h-10 text-amber-500 fill-current" />
           </div>
        </div>
        
        <h1 className="text-4xl font-bold font-arabic mb-3 text-emerald-950 text-center">{t.appTitle}</h1>
        <p className="text-slate-500 text-center mb-12 tracking-wide text-sm font-medium">{t.appSubtitle}</p>
        
        <div className="space-y-4 w-full max-w-xs">
          <FeatureCard 
            icon={<MapPin className="w-5 h-5 text-emerald-600" />} 
            title={t.preciseLocation}
            desc={t.preciseLocationDesc}
            delay="0.1s"
          />
          <FeatureCard 
            icon={<Clock className="w-5 h-5 text-emerald-600" />} 
            title={t.accurateTimings}
            desc={t.accurateTimingsDesc}
            delay="0.2s"
          />
          <FeatureCard 
            icon={<Bell className="w-5 h-5 text-emerald-600" />} 
            title={t.smartAlerts}
            desc={t.smartAlertsDesc}
            delay="0.3s"
          />
        </div>
      </div>

      <div className="p-8 z-10 pb-12 bg-white">
        <button 
          onClick={onComplete}
          className="group w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 rounded-2xl shadow-lg shadow-emerald-200 flex items-center justify-center space-x-3 transition-all active:scale-95"
        >
          <span className="text-lg">{t.getStarted}</span>
          {isRTL ? (
             <ArrowLeft className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
          ) : (
             <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
          )}
        </button>
      </div>
    </div>
  );
};

const FeatureCard = ({ icon, title, desc, delay }: { icon: React.ReactNode, title: string, desc: string, delay: string }) => (
  <div 
    className="flex items-center space-x-4 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm opacity-0 animate-fade-in-up"
    style={{ animationDelay: delay }}
  >
    <div className="p-2.5 bg-emerald-50 rounded-xl">
      {icon}
    </div>
    <div className="text-left rtl:text-right">
      <h3 className="font-bold text-slate-800 text-sm">{title}</h3>
      <p className="text-xs text-slate-500 leading-tight mt-0.5">{desc}</p>
    </div>
  </div>
);