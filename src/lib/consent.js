// Ladowanie GA4 + Clarity wylacznie po zgodzie uzytkownika (RODO/UE).
// Bez zgody window.gtag nigdy nie powstaje, wiec trackPageView/trackEvent
// w lib/analytics.js po cichu nic nie robia (juz maja na to zabezpieczenie).

const GA4_ID = "G-P0TWBVC0C8";
const CLARITY_ID = "xw45d6vv8m";
const STORAGE_KEY = "kengo_cookie_consent";

export function getConsent() {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(STORAGE_KEY);
}

export function setConsent(value) {
  window.localStorage.setItem(STORAGE_KEY, value);
}

export function loadAnalytics() {
  if (typeof window === "undefined" || window.gtag) return; // juz zaladowane

  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA4_ID}`;
  document.head.appendChild(script);

  window.dataLayer = window.dataLayer || [];
  window.gtag = function () { window.dataLayer.push(arguments); };
  window.gtag("js", new Date());
  window.gtag("config", GA4_ID, { send_page_view: false });

  (function (c, l, a, r, i, t, y) {
    c[a] = c[a] || function () { (c[a].q = c[a].q || []).push(arguments); };
    t = l.createElement(r); t.async = 1; t.src = "https://www.clarity.ms/tag/" + i;
    y = l.getElementsByTagName(r)[0]; y.parentNode.insertBefore(t, y);
  })(window, document, "clarity", "script", CLARITY_ID);
}
