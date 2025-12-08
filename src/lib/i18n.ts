import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import en from '@/locales/en.json';
import fr from '@/locales/fr.json';
import yo from '@/locales/yo.json';
import ig from '@/locales/ig.json';
import ha from '@/locales/ha.json';

const resources = {
  en: { translation: en },
  fr: { translation: fr },
  yo: { translation: yo },
  ig: { translation: ig },
  ha: { translation: ha },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    detection: {
      order: ['localStorage', 'navigator'],
      lookupLocalStorage: 'language',
      caches: ['localStorage'],
    },
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
