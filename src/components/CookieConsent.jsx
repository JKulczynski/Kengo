import React, { useState, useEffect } from "react";
import { getConsent, setConsent, loadAnalytics } from "@/lib/consent";

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const stored = getConsent();
    if (stored === "granted") {
      loadAnalytics();
    } else if (!stored) {
      setVisible(true);
    }
  }, []);

  const accept = () => {
    setConsent("granted");
    loadAnalytics();
    setVisible(false);
  };

  const decline = () => {
    setConsent("denied");
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      className="fixed top-0 inset-x-0 z-[200] px-4 py-3 flex flex-col sm:flex-row items-center gap-3 border-b"
      style={{ backgroundColor: "var(--k-bg-surface)", borderColor: "var(--k-border-md)" }}
    >
      <p className="text-xs flex-1 text-center sm:text-left" style={{ color: "var(--k-text-muted)" }}>
        Używamy plików cookie do analizy ruchu (Google Analytics, Microsoft Clarity), żeby ulepszać Kengo. Możesz się nie zgodzić bez wpływu na działanie apki.
      </p>
      <div className="flex gap-2 flex-shrink-0">
        <button
          onClick={decline}
          className="text-xs font-medium px-4 py-2 rounded-lg border"
          style={{ color: "var(--k-text-muted)", borderColor: "var(--k-border-md)" }}
        >
          Odrzuć
        </button>
        <button
          onClick={accept}
          className="btn-primary text-xs font-medium px-4 py-2 rounded-lg"
        >
          Akceptuję
        </button>
      </div>
    </div>
  );
}
