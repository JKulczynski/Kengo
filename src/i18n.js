import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import pl from '@/locales/pl.json';
import en from '@/locales/en.json';

const STORAGE_KEY = 'kengo_language';

function resolveInitialLanguage() {
  if (typeof window === 'undefined') return 'pl';

  const urlLang = new URLSearchParams(window.location.search).get('lang');
  if (urlLang === 'pl' || urlLang === 'en') {
    localStorage.setItem(STORAGE_KEY, urlLang);
    return urlLang;
  }

  return localStorage.getItem(STORAGE_KEY) || 'pl';
}

const savedLanguage = resolveInitialLanguage();

i18n
  .use(initReactI18next)
  .init({
    resources: {
      pl: { translation: pl },
      en: { translation: en },
    },
    lng: savedLanguage,
    fallbackLng: 'pl',
    interpolation: {
      escapeValue: false,
    },
  });

export function setLanguage(lang) {
  i18n.changeLanguage(lang);
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, lang);
  }
}

export default i18n;
