import { pl, enUS } from 'date-fns/locale';
import { useTranslation } from 'react-i18next';

// Zwraca właściwy locale date-fns (pl / enUS) na podstawie aktywnego języka aplikacji.
export function useDateLocale() {
  const { i18n } = useTranslation();
  return i18n.language?.startsWith('en') ? enUS : pl;
}
