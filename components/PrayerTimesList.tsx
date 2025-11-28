import React, { useEffect, useState } from 'react';
import { Settings as SettingsIcon, MapPin, Bell, BellOff } from 'lucide-react';
import { format } from 'date-fns';
import { City, PrayerTime, AppSettings } from '../types';
import { getPrayerTimesForDay } from '../services/prayerService';
import { requestNotificationPermission } from '../services/notificationService';
import { translations } from '../translations';

interface Props {
  city: City;
  settings: AppSettings;
  onOpenSettings: () => void;
  onChangeCity: () => void;
  onTogglePrayer: (id: string, enabled: boolean) => void;
}

export const PrayerTimesList: React.FC<Props> = ({ 
  city, 
  settings, 
  onOpenSettings, 
  onChangeCity,
  onTogglePrayer
}) => {
  const t = translations[settings.language];
  const isRTL = settings.language === 'ar';
  
  const [times, setTimes] = useState<PrayerTime[]>([]);
  const [timeLeft, setTimeLeft] = useState<string>('');
  const [nextPrayer, setNextPrayer] = useState<PrayerTime | null>(null);

  // Update times on mount and when settings change
  useEffect(() => {
    const today = new Date();
    const dailyTimes = getPrayerTimesForDay(city.coords, settings.method, today);
    setTimes(dailyTimes);
  }, [city, settings.method]);

  // Clock effect for countdown
  useEffect(() => {
    const tick = () => {
        const now = new Date();
        const next = times.find(p => p.time > now);
        setNextPrayer(next || null);
        
        if (next) {
            const diff = next.time.getTime() - now.getTime();
            const hours = Math.floor(diff / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((diff % (1000 * 60)) / 1000);
            
            // Format 00:00:00
            const hStr = hours.toString().padStart(2, '0');
            const mStr = minutes.toString().padStart(2, '0');
            const sStr = seconds.toString().padStart(2, '0');
            setTimeLeft(`${hStr}:${mStr}:${sStr}`);
        } else {
            setTimeLeft('---');
        }
    };
    
    const interval = setInterval(tick, 1000);
    tick(); 
    return () => clearInterval(interval);
  }, [times]);

  const handleNotificationToggle = async (id: string, current: boolean) => {
    if (!current) {
        const granted = await requestNotificationPermission();
        if (granted) {
            onTogglePrayer(id, true);
        } else {
            alert(t.pleaseAllow);
        }
    } else {
        onTogglePrayer(id, false);
    }
  };
  
  // Helper to translate prayer names for display
  const getTranslatedName = (key: string) => {
     // @ts-ignore
     return t[key] || key;
  };

  return (
    <div className="flex flex-col h-full bg-artistic relative" dir={isRTL ? 'rtl' : 'ltr'}>
        <div className="absolute inset-0 bg-pattern pointer-events-none z-0"></div>

        {/* Top Hero Section */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-500 text-white rounded-b-[2.5rem] shadow-xl z-10 relative overflow-hidden shrink-0">
         {/* Background Decoration */}
         <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[url('https://www.transparenttextures.com/patterns/arabesque.png')]"></div>
         <div className={`absolute -top-10 ${isRTL ? '-left-10' : '-right-10'} w-40 h-40 bg-white/10 rounded-full blur-[40px]`}></div>

         <div className="p-6 pb-10 relative">
            {/* Header Nav */}
            <div className="flex justify-between items-start mb-6">
                <button 
                    onClick={onChangeCity} 
                    className="flex flex-col items-start group"
                >
                    <div className="flex items-center space-x-1 rtl:space-x-reverse text-emerald-100 mb-0.5 opacity-80">
                        <MapPin className="w-3.5 h-3.5" />
                        <span className="text-xs font-medium tracking-wider uppercase">{t.location}</span>
                    </div>
                    <span className="font-bold text-lg truncate max-w-[200px] border-b border-transparent group-hover:border-white/50 transition-all">{city.name}</span>
                </button>
                
                <button onClick={onOpenSettings} className="p-2 bg-white/10 rounded-xl hover:bg-white/20 transition-all backdrop-blur-md border border-white/10 active:scale-95">
                    <SettingsIcon className="w-5 h-5 text-white" />
                </button>
            </div>

            {/* Main Timer Display */}
            <div className="flex flex-col items-center justify-center text-center mt-2 mb-2">
                <div className="inline-block px-3 py-1 rounded-full bg-emerald-800/20 backdrop-blur-md border border-emerald-400/20 text-emerald-50 text-[10px] font-bold tracking-widest uppercase mb-3">
                    {t.nextPrayer}
                </div>
                
                <div className="relative">
                     <h1 className="text-5xl font-bold font-arabic mb-1 text-white drop-shadow-md pb-2">
                        {nextPrayer ? getTranslatedName(nextPrayer.id) : '---'}
                    </h1>
                     {nextPrayer && <div className={`text-sm font-arabic text-emerald-100 absolute -top-4 ${isRTL ? '-left-6' : '-right-6'} opacity-70`}>{nextPrayer.nameArabic}</div>}
                </div>

                <div className="mt-1 font-mono text-3xl tracking-wider text-emerald-50/90 tabular-nums font-light">
                    {timeLeft}
                </div>
            </div>
         </div>
      </div>

      {/* Prayer List Container */}
      <div className="flex-1 -mt-6 pt-4 px-4 pb-4 overflow-y-auto space-y-3 z-10">
        {/* Date Header */}
        <div className="flex justify-center mb-3">
             <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                {format(new Date(), 'EEEE, MMMM do')}
            </span>
        </div>

        {times.map((prayer, idx) => {
            const isEnabled = settings.enabledPrayers[prayer.id];
            const isNext = prayer.isNext;
            const displayName = getTranslatedName(prayer.id);
            
            return (
                <div 
                    key={prayer.id}
                    className={`relative flex items-center justify-between p-4 rounded-2xl transition-all duration-300 ${
                        isNext 
                        ? `bg-white ${isRTL ? 'border-r-4 border-r-amber-400' : 'border-l-4 border-l-amber-400'} shadow-md scale-[1.01] z-10` 
                        : 'bg-white border border-slate-100 shadow-sm hover:border-emerald-100'
                    } animate-fade-in-up`}
                    style={{ animationDelay: `${idx * 0.07}s` }}
                >
                    <div className={`flex items-center space-x-4 pl-1 rtl:space-x-reverse rtl:pl-0 rtl:pr-1`}>
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${
                            isNext 
                            ? 'bg-amber-100 text-amber-600' 
                            : 'bg-slate-50 text-slate-400'
                        }`}>
                            <span className="font-arabic mt-1">{prayer.nameArabic.charAt(0)}</span>
                        </div>
                        <div className="rtl:text-right">
                            <div className={`font-bold text-base leading-tight ${isNext ? 'text-slate-800' : 'text-slate-600'}`}>
                                {displayName}
                            </div>
                            <div className={`text-[10px] uppercase font-bold tracking-wider ${isNext ? 'text-amber-500' : 'text-slate-300'}`}>
                                {prayer.nameArabic}
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center space-x-3 rtl:space-x-reverse">
                        <span className={`font-mono text-base font-semibold ${isNext ? 'text-emerald-600' : 'text-slate-500'}`}>
                            {format(prayer.time, 'h:mm')} <span className="text-xs text-slate-400">{format(prayer.time, 'a')}</span>
                        </span>
                        
                        <button 
                            onClick={() => handleNotificationToggle(prayer.id, isEnabled)}
                            className={`p-2 rounded-full transition-all duration-300 ${
                                isEnabled 
                                ? 'text-white bg-emerald-500 shadow-sm hover:bg-emerald-600' 
                                : 'text-slate-300 bg-slate-100 hover:bg-slate-200'
                            }`}
                        >
                            {isEnabled ? <Bell className="w-4 h-4 fill-current" /> : <BellOff className="w-4 h-4" />}
                        </button>
                    </div>
                </div>
            );
        })}
      </div>
    </div>
  );
};