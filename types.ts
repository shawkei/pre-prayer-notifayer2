export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface City {
  name: string;
  country: string;
  coords: Coordinates;
  searchString?: string;
}

export enum CalculationMethod {
  MWL = 'MWL',
  ISNA = 'ISNA',
  EGYPTIAN = 'EGYPTIAN',
  MAKKAH = 'MAKKAH',
  KARACHI = 'KARACHI',
  TEHRAN = 'TEHRAN',
}

export type Language = 'en' | 'ar';

export interface AppSettings {
  method: CalculationMethod;
  preAdhanOffsetMinutes: number;
  enabledPrayers: Record<string, boolean>;
  hasCompletedOnboarding: boolean;
  language: Language;
}

export interface PrayerTime {
  id: string;
  nameEnglish: string;
  nameArabic: string;
  time: Date;
  isNext: boolean;
}

// Global window declaration for Capacitor
declare global {
  interface Window {
    Capacitor: any;
  }
}