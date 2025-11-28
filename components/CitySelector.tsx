import React, { useState, useMemo } from 'react';
import { Search, MapPin, Navigation, ChevronRight, Globe, ChevronLeft } from 'lucide-react';
import { City } from '../types';
import { CITIES } from '../constants';
import { translations, Language } from '../translations';

interface Props {
  onSelectCity: (city: City) => void;
  lang: Language;
}

export const CitySelector: React.FC<Props> = ({ onSelectCity, lang }) => {
  const t = translations[lang];
  const isRTL = lang === 'ar';
  
  const [searchTerm, setSearchTerm] = useState('');
  const [manualMode, setManualMode] = useState(false);
  const [manualLat, setManualLat] = useState('');
  const [manualLng, setManualLng] = useState('');

  const filteredCities = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return CITIES.filter(c => 
      c.name.toLowerCase().includes(term) || 
      c.country.toLowerCase().includes(term)
    );
  }, [searchTerm]);

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const lat = parseFloat(manualLat);
    const lng = parseFloat(manualLng);
    if (!isNaN(lat) && !isNaN(lng)) {
      onSelectCity({
        name: t.manualLoc,
        country: 'Manual Coordinates',
        coords: { latitude: lat, longitude: lng }
      });
    }
  };

  const getUserLocation = () => {
    if (navigator.geolocation) {
       navigator.geolocation.getCurrentPosition((position) => {
         onSelectCity({
            name: t.gpsLoc,
            country: 'GPS Detected',
            coords: {
                latitude: position.coords.latitude,
                longitude: position.coords.longitude
            }
         });
       }, (err) => {
         alert('Could not get location: ' + err.message);
       });
    } else {
        alert('Geolocation is not supported by this browser.');
    }
  };

  return (
    <div className="flex flex-col h-full bg-artistic relative" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="absolute inset-0 bg-pattern pointer-events-none z-0"></div>

      <div className="px-6 pt-8 pb-4 bg-white/80 backdrop-blur-md border-b border-slate-100 sticky top-0 z-20">
        <div className="flex justify-between items-center mb-4">
            <div>
                <h2 className="text-2xl font-bold text-slate-800">{t.selectCity}</h2>
                <p className="text-slate-500 text-sm">{t.whereLocated}</p>
            </div>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-full">
                <Globe className="w-5 h-5" />
            </div>
        </div>
        
        {!manualMode ? (
            <div className="relative group">
                <div className={`absolute inset-y-0 ${isRTL ? 'right-0 pr-3' : 'left-0 pl-3'} flex items-center pointer-events-none`}>
                     <Search className="w-5 h-5 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
                </div>
                <input
                    type="text"
                    placeholder={t.searchPlaceholder}
                    className={`block w-full py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:bg-white transition-all font-medium ${isRTL ? 'pr-10 pl-3' : 'pl-10 pr-3'}`}
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                />
            </div>
        ) : (
             <form onSubmit={handleManualSubmit} className="space-y-3 animate-fade-in-up">
                <div className="flex space-x-2 rtl:space-x-reverse">
                    <input 
                        type="number" step="any" placeholder={t.latitude} required
                        value={manualLat} onChange={e => setManualLat(e.target.value)}
                        className="w-1/2 p-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                    />
                     <input 
                        type="number" step="any" placeholder={t.longitude} required
                        value={manualLng} onChange={e => setManualLng(e.target.value)}
                        className="w-1/2 p-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                    />
                </div>
                <button type="submit" className="w-full bg-emerald-600 text-white py-3 rounded-xl font-bold shadow-lg shadow-emerald-200 transition-all active:scale-[0.98]">
                    {t.confirmCoordinates}
                </button>
             </form>
        )}
        
        <div className="flex justify-between mt-4">
            <button onClick={() => setManualMode(!manualMode)} className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 transition-colors py-1 hover:bg-emerald-50 rounded-md px-2 -ml-2 rtl:-mr-2 rtl:ml-0">
                {manualMode ? t.backToSearch : t.enterCoordinates}
            </button>
            <button onClick={getUserLocation} className="flex items-center text-xs font-semibold text-white bg-slate-800 hover:bg-slate-900 transition-colors px-3 py-1.5 rounded-full shadow-md">
                <Navigation className={`w-3 h-3 ${isRTL ? 'ml-1.5' : 'mr-1.5'}`} /> {t.useGPS}
            </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-2.5 z-10">
        {!manualMode && filteredCities.map((city: City, idx: number) => (
          <button
            key={`${city.name}-${idx}`}
            onClick={() => onSelectCity(city)}
            className="w-full flex items-center justify-between p-4 bg-white border border-slate-100 rounded-xl hover:border-emerald-200 hover:shadow-md transition-all group animate-fade-in-up"
            style={{ animationDelay: `${idx * 0.05}s` }}
          >
            <div className="flex items-center space-x-4 rtl:space-x-reverse">
                <div className="w-10 h-10 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-emerald-50 group-hover:text-emerald-600 transition-colors">
                    <MapPin className="w-5 h-5" />
                </div>
                <div className={`text-left ${isRTL ? 'text-right' : ''}`}>
                    <div className="font-bold text-slate-800 text-base leading-none mb-1">{city.name}</div>
                    <div className="text-xs text-slate-500 font-medium uppercase tracking-wider">{city.country}</div>
                </div>
            </div>
            {isRTL ? <ChevronLeft className="w-4 h-4 text-slate-300 group-hover:text-emerald-500" /> : <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-emerald-500" />}
          </button>
        ))}
        
        {!manualMode && filteredCities.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400 opacity-60">
                <Search className="w-12 h-12 mb-3 stroke-1" />
                <p className="text-sm">{t.noCitiesFound}</p>
            </div>
        )}
        <div className="h-4"></div>
      </div>
    </div>
  );
};