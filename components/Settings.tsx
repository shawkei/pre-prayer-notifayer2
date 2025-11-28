import React from 'react';
import { ArrowLeft, BellRing, Calculator, Clock, ChevronRight, ShieldCheck, Languages, ArrowRight } from 'lucide-react';
import { AppSettings, CalculationMethod, Language } from '../types';
import { sendNotification, requestNotificationPermission } from '../services/notificationService';
import { translations } from '../translations';

interface Props {
  settings: AppSettings;
  onUpdateSettings: (s: AppSettings) => void;
  onBack: () => void;
}

export const Settings: React.FC<Props> = ({ settings, onUpdateSettings, onBack }) => {
  const t = translations[settings.language];
  const isRTL = settings.language === 'ar';

  const handleMethodChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onUpdateSettings({ ...settings, method: e.target.value as CalculationMethod });
  };

  const handleOffsetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value);
    if (!isNaN(val) && val >= 0) {
        onUpdateSettings({ ...settings, preAdhanOffsetMinutes: val });
    }
  };

  const handleLanguageToggle = () => {
    const newLang = settings.language === 'en' ? 'ar' : 'en';
    onUpdateSettings({ ...settings, language: newLang });
  };

  const testNotification = async () => {
    const granted = await requestNotificationPermission();
    if(granted) {
      sendNotification(t.testTitle, t.testBody);
    } else {
      alert("Permission denied");
    }
  };

  return (
    <div className="flex flex-col h-full bg-artistic" dir={isRTL ? 'rtl' : 'ltr'}>
        <div className="absolute inset-0 bg-pattern pointer-events-none z-0"></div>

      {/* Header */}
      <div className="px-6 py-5 bg-white/80 backdrop-blur-md sticky top-0 z-20 flex items-center border-b border-slate-100">
        <button onClick={onBack} className={`p-2 text-slate-500 hover:bg-slate-50 hover:text-slate-900 rounded-full transition-colors active:scale-95 ${isRTL ? '-mr-2 ml-2' : '-ml-2 ml-2'}`}>
            {isRTL ? <ArrowRight className="w-5 h-5" /> : <ArrowLeft className="w-5 h-5" />}
        </button>
        <h2 className="text-lg font-bold text-slate-800">{t.preferences}</h2>
      </div>

      <div className="flex-1 overflow-y-auto p-5 space-y-5 z-10">

        {/* Language Section */}
        <section className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm animate-fade-in-up" style={{ animationDelay: '0.05s' }}>
             <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3 rtl:space-x-reverse">
                    <div className="p-2 bg-pink-50 text-pink-600 rounded-lg">
                        <Languages className="w-5 h-5" />
                    </div>
                    <div>
                        <h3 className="font-bold text-slate-800 text-sm">{t.language}</h3>
                        <p className="text-xs text-slate-400">{t.languageDesc}</p>
                    </div>
                </div>
                <button 
                    onClick={handleLanguageToggle}
                    className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold text-slate-600 hover:bg-slate-100 transition-colors"
                >
                    {settings.language === 'en' ? 'English' : 'العربية'}
                </button>
             </div>
        </section>
        
        {/* Calculation Section */}
        <section className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            <div className="flex items-center space-x-3 rtl:space-x-reverse mb-4">
                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                    <Calculator className="w-5 h-5" />
                </div>
                <div>
                    <h3 className="font-bold text-slate-800 text-sm">{t.calcMethod}</h3>
                    <p className="text-xs text-slate-400">{t.calcMethodDesc}</p>
                </div>
            </div>
            
            <div className="relative">
                <select 
                    value={settings.method} 
                    onChange={handleMethodChange}
                    className={`w-full p-3.5 bg-slate-50 rounded-xl appearance-none outline-none focus:ring-2 focus:ring-emerald-500/30 border border-slate-200 text-slate-700 font-medium text-sm transition-all ${isRTL ? 'pl-10 text-right' : 'pr-10'}`}
                >
                    <option value={CalculationMethod.EGYPTIAN}>Egyptian General Authority</option>
                    <option value={CalculationMethod.MWL}>Muslim World League</option>
                    <option value={CalculationMethod.ISNA}>ISNA (North America)</option>
                    <option value={CalculationMethod.MAKKAH}>Umm Al-Qura (Makkah)</option>
                    <option value={CalculationMethod.KARACHI}>Karachi (Hanfi)</option>
                    <option value={CalculationMethod.TEHRAN}>Tehran (Institute of Geophysics)</option>
                </select>
                <ChevronRight className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 rotate-90 pointer-events-none ${isRTL ? 'left-4' : 'right-4'}`} />
            </div>
        </section>

        {/* Notifications Section */}
        <section className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            <div className="flex items-center space-x-3 rtl:space-x-reverse mb-4">
                <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
                    <Clock className="w-5 h-5" />
                </div>
                <div>
                    <h3 className="font-bold text-slate-800 text-sm">{t.alertTiming}</h3>
                    <p className="text-xs text-slate-400">{t.whenToNotify}</p>
                </div>
            </div>
            
            <div className="flex items-center justify-between mb-5 bg-slate-50 p-3 rounded-xl border border-slate-100">
                <label className="text-slate-600 font-medium text-sm">{t.notifyBefore}</label>
                <div className="flex items-center bg-white rounded-lg px-3 py-1 border border-slate-200 shadow-sm focus-within:border-amber-400">
                    <input 
                        type="number" 
                        min="0" max="60"
                        value={settings.preAdhanOffsetMinutes}
                        onChange={handleOffsetChange}
                        className="w-10 text-center font-bold text-slate-800 outline-none"
                    />
                    <span className={`text-xs text-slate-400 font-medium border-slate-100 ${isRTL ? 'pr-1 border-r mr-1' : 'pl-1 border-l ml-1'}`}>{t.minutes}</span>
                </div>
            </div>

            <button 
                onClick={testNotification}
                className="w-full flex items-center justify-center space-x-2 rtl:space-x-reverse py-3 border border-dashed border-emerald-200 text-emerald-700 bg-emerald-50 rounded-xl hover:bg-emerald-100 transition-all font-semibold text-sm active:scale-[0.98]"
            >
                <BellRing className="w-4 h-4" />
                <span>{t.testSound}</span>
            </button>
        </section>

        {/* Info Section */}
        <section className="p-4 rounded-2xl animate-fade-in-up flex items-start space-x-3 rtl:space-x-reverse opacity-60 bg-slate-50 border border-slate-100" style={{ animationDelay: '0.3s' }}>
             <ShieldCheck className="w-5 h-5 text-emerald-600 mt-0.5 shrink-0" />
             <div className="text-xs text-slate-500 leading-relaxed text-start">
                {t.privacyNote}
             </div>
        </section>

        <div className="pt-8 flex flex-col items-center justify-center space-y-2 opacity-50">
            <span className="text-[10px] text-slate-400 font-mono">Mu'adhin App v1.4</span>
        </div>

      </div>
    </div>
  );
};