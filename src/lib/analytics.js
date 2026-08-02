// Cienka warstwa nad GA4 (gtag.js, zaladowany w index.html) + eventami Supabase.
// gtag jest zdefiniowany jako zwykla funkcja globalna w index.html (nie modul),
// wiec window.gtag jest dostepny zanim React w ogole zacznie renderowac.
import { AnalyticsEvent } from "@/api/entities";

export function trackPageView(path) {
  if (typeof window === 'undefined' || !window.gtag) return;
  window.gtag('event', 'page_view', { page_path: path });
}

export function trackEvent(name, params = {}) {
  if (typeof window === 'undefined' || !window.gtag) return;
  window.gtag('event', name, params);
}

// Loguje jeden event i do GA4 (dashboard/engagement time), i do Supabase
// (dokladne liczby per event, wlasna tabelka, zero zaleznosci od planu Vercela).
// Nigdy nie rzuca — analityka nie moze wywalic realnej akcji uzytkownika.
export async function trackProductEvent(name, metadata = {}) {
  trackEvent(name, metadata);
  try {
    await AnalyticsEvent.create({ event_name: name, metadata });
  } catch (e) {
    console.error(`Analytics event "${name}" nie zapisany:`, e);
  }
}
