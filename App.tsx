import React, { useState, useEffect, useRef } from 'react';
import { Onboarding } from './components/Onboarding';
import { CitySelector } from './components/CitySelector';
import { PrayerTimesList } from './components/PrayerTimesList';
import { Settings } from './components/Settings';
import { AppSettings, City } from './types';
import { DEFAULT_SETTINGS } from './constants';
import { getPrayerTimesForDay } from './services/prayerService';
import { sendNotification, schedulePrayerNotifications } from './services/notificationService';
import { translations } from './translations';

const SETTINGS_KEY = 'muadhin_settings';
const CITY_KEY = 'muadhin_city';

const App: React.FC = () => {
  const [view, setView] = useState<'onboarding' | 'city' | 'dashboard' | 'settings'>('onboarding');
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [city, setCity] = useState<City | null>(null);

  useEffect(() => {
    const storedSettings = localStorage.getItem(SETTINGS_KEY);
    const storedCity = localStorage.getItem(CITY_KEY);

    if (storedSettings) {
      const parsed = JSON.parse(storedSettings);
      setSettings(prev => ({ ...prev, ...parsed }));
      
      if (storedCity) {
        setCity(JSON.parse(storedCity));
        if (parsed.hasCompletedOnboarding) {
          setView('dashboard');
        }
      } else {
        if (parsed.hasCompletedOnboarding) {
            setView('city');
        }
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    handleScheduleUpdate();
  }, [settings]);

  useEffect(() => {
    if (city) {
      localStorage.setItem(CITY_KEY, JSON.stringify(city));
      handleScheduleUpdate();
    }
  }, [city]);

  const lastCheckMinute = useRef<string>('');

  const handleScheduleUpdate = () => {
    if (!city || !settings.hasCompletedOnboarding) return;
    
    const now = new Date();
    const prayers = getPrayerTimesForDay(city.coords, settings.method, now);
    const t = translations[settings.language];
    
    schedulePrayerNotifications(
        prayers, 
        settings.enabledPrayers, 
        settings.preAdhanOffsetMinutes, 
        { title: t.upcomingPrayer, body: t.inMinutes }
    );
  };

  useEffect(() => {
    if (!city || !settings.hasCompletedOnboarding) return;

    const checkAlarmsWeb = () => {
      // Skip polling if running native, as LocalNotifications are scheduled
      if (window.Capacitor?.isNativePlatform()) return;

      const now = new Date();
      const currentMinuteStr = `${now.getFullYear()}-${now.getMonth()}-${now.getDate()} ${now.getHours()}:${now.getMinutes()}`;
      
      if (currentMinuteStr === lastCheckMinute.current) return;
      lastCheckMinute.current = currentMinuteStr;

      const prayers = getPrayerTimesForDay(city.coords, settings.method, now);
      const offsetMs = settings.preAdhanOffsetMinutes * 60 * 1000;
      const t = translations[settings.language];

      prayers.forEach(p => {
        if (!settings.enabledPrayers[p.id]) return;

        const alarmTime = new Date(p.time.getTime() - offsetMs);
        
        if (
             alarmTime.getHours() === now.getHours() && 
             alarmTime.getMinutes() === now.getMinutes() &&
             alarmTime.getSeconds() < 10
        ) {
            const body = t.inMinutes.replace('{min}', settings.preAdhanOffsetMinutes.toString()) + ` (${p.nameEnglish})`;
            sendNotification(t.upcomingPrayer, body);
        }
      });
    };

    const interval = setInterval(checkAlarmsWeb, 5000);
    return () => clearInterval(interval);
  }, [city, settings]);

  const finishOnboarding = () => {
    setSettings(prev => ({ ...prev, hasCompletedOnboarding: true }));
    setView('city');
  };

  const handleCitySelect = (selectedCity: City) => {
    setCity(selectedCity);
    setView('dashboard');
  };

  const togglePrayer = (id: string, enabled: boolean) => {
    setSettings(prev => ({
        ...prev,
        enabledPrayers: { ...prev.enabledPrayers, [id]: enabled }
    }));
  };

  return (
    <div className="w-full h-screen max-w-md mx-auto bg-white overflow-hidden shadow-2xl relative select-none" dir={settings.language === 'ar' ? 'rtl' : 'ltr'}>
      {view === 'onboarding' && <Onboarding onComplete={finishOnboarding} lang={settings.language} />}
      
      {view === 'city' && <CitySelector onSelectCity={handleCitySelect} lang={settings.language} />}
      
      {view === 'dashboard' && city && (
        <PrayerTimesList 
            city={city} 
            settings={settings}
            onOpenSettings={() => setView('settings')}
            onChangeCity={() => setView('city')}
            onTogglePrayer={togglePrayer}
        />
      )}

      {view === 'settings' && (
        <Settings 
            settings={settings} 
            onUpdateSettings={setSettings}
            onBack={() => setView('dashboard')}
        />
      )}
    </div>
  );
};

export default App;