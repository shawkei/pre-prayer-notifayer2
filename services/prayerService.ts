import { Coordinates, CalculationMethod, PrayerTime } from '../types';
import { Coordinates as AdhanCoordinates, CalculationMethod as AdhanMethod, PrayerTimes } from 'adhan';

// Mapping local enum to Adhan library method
const getAdhanMethod = (method: CalculationMethod) => {
  switch (method) {
    case CalculationMethod.MWL: return AdhanMethod.MuslimWorldLeague();
    case CalculationMethod.ISNA: return AdhanMethod.NorthAmerica();
    case CalculationMethod.EGYPTIAN: return AdhanMethod.Egyptian();
    case CalculationMethod.MAKKAH: return AdhanMethod.UmmAlQura();
    case CalculationMethod.KARACHI: return AdhanMethod.Karachi();
    case CalculationMethod.TEHRAN: return AdhanMethod.Tehran();
    default: return AdhanMethod.Egyptian();
  }
};

export const getPrayerTimesForDay = (coords: Coordinates, method: CalculationMethod, date: Date = new Date()): PrayerTime[] => {
  const adhanCoords = new AdhanCoordinates(coords.latitude, coords.longitude);
  const params = getAdhanMethod(method);
  
  const prayerTimes = new PrayerTimes(adhanCoords, date, params);

  const now = new Date();
  
  const list = [
    { id: 'fajr', nameEnglish: 'Fajr', nameArabic: 'الفجر', time: prayerTimes.fajr },
    { id: 'sunrise', nameEnglish: 'Sunrise', nameArabic: 'الشروق', time: prayerTimes.sunrise },
    { id: 'dhuhr', nameEnglish: 'Dhuhr', nameArabic: 'الظهر', time: prayerTimes.dhuhr },
    { id: 'asr', nameEnglish: 'Asr', nameArabic: 'العصر', time: prayerTimes.asr },
    { id: 'maghrib', nameEnglish: 'Maghrib', nameArabic: 'المغرب', time: prayerTimes.maghrib },
    { id: 'isha', nameEnglish: 'Isha', nameArabic: 'العشاء', time: prayerTimes.isha },
  ];

  // Determine next prayer
  let nextPrayerId = '';
  const upcoming = list.filter(p => p.time > now);
  if (upcoming.length > 0) {
    nextPrayerId = upcoming[0].id;
  }

  return list.map(p => ({
    ...p,
    isNext: p.id === nextPrayerId
  }));
};