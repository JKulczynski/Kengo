export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--k-bg)", color: "var(--k-text)" }}>
      <div className="max-w-2xl mx-auto px-6 py-16">

        <div className="mb-12">
          <p className="text-sm font-medium tracking-widest uppercase mb-4" style={{ color: "var(--k-accent-dark)" }}>
            Kengo
          </p>
          <h1 className="text-3xl font-light mb-2" style={{ color: "var(--k-text)" }}>
            Polityka prywatności
          </h1>
          <p className="text-sm" style={{ color: "var(--k-text-subtle)" }}>
            Ostatnia aktualizacja: 16 maja 2026
          </p>
        </div>

        <div className="space-y-10 text-base leading-relaxed" style={{ color: "var(--k-text-muted)" }}>

          <section>
            <h2 className="text-lg font-medium mb-3" style={{ color: "var(--k-text)" }}>1. Administrator danych</h2>
            <p>
              Administratorem Twoich danych osobowych jest Jan Kulczynski, prowadzący działalność pod marką Kengo.
              Kontakt: kengo.app.pl@gmail.com
            </p>
          </section>

          <section>
            <h2 className="text-lg font-medium mb-3" style={{ color: "var(--k-text)" }}>2. Jakie dane zbieramy</h2>
            <ul className="space-y-2 list-none">
              {[
                "Adres e-mail — do rejestracji i logowania",
                "Dane projektów remontowych — nazwy, opisy, daty podane przez Ciebie",
                "Dokumenty i pliki — faktury, gwarancje i inne pliki które przesyłasz",
                "Notatki — treści wpisywane ręcznie w aplikacji",
                "Dane techniczne — logi błędów, informacje o urządzeniu (anonimowe)",
              ].map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <span className="mt-1.5 w-1 h-1 rounded-full shrink-0" style={{ backgroundColor: "var(--k-accent)" }} />
                  {item}
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-medium mb-3" style={{ color: "var(--k-text)" }}>3. Cel i podstawa przetwarzania</h2>
            <p className="mb-3">
              Twoje dane przetwarzamy wyłącznie w celu świadczenia usługi Kengo, w szczególności:
            </p>
            <ul className="space-y-2 list-none">
              {[
                "Umożliwienie logowania i korzystania z aplikacji (podstawa: wykonanie umowy — art. 6 ust. 1 lit. b RODO)",
                "Przechowywanie danych projektów i dokumentów (podstawa: wykonanie umowy)",
                "Poprawa działania aplikacji i eliminacja błędów (podstawa: prawnie uzasadniony interes — art. 6 ust. 1 lit. f RODO)",
              ].map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <span className="mt-1.5 w-1 h-1 rounded-full shrink-0" style={{ backgroundColor: "var(--k-accent)" }} />
                  {item}
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-medium mb-3" style={{ color: "var(--k-text)" }}>4. Przechowywanie danych</h2>
            <p>
              Dane przechowywane są na serwerach Supabase zlokalizowanych w Unii Europejskiej.
              Supabase działa zgodnie z RODO i stosuje odpowiednie środki bezpieczeństwa.
              Dane przechowujemy przez czas korzystania z aplikacji, a po usunięciu konta przez maksymalnie 30 dni.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-medium mb-3" style={{ color: "var(--k-text)" }}>5. Twoje prawa</h2>
            <p className="mb-3">Na podstawie RODO przysługują Ci następujące prawa:</p>
            <ul className="space-y-2 list-none">
              {[
                "Prawo dostępu do swoich danych",
                "Prawo do sprostowania danych",
                "Prawo do usunięcia danych (prawo do bycia zapomnianym)",
                "Prawo do ograniczenia przetwarzania",
                "Prawo do przenoszenia danych",
                "Prawo do wniesienia sprzeciwu wobec przetwarzania",
                "Prawo do wniesienia skargi do UODO (uodo.gov.pl)",
              ].map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <span className="mt-1.5 w-1 h-1 rounded-full shrink-0" style={{ backgroundColor: "var(--k-accent)" }} />
                  {item}
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-medium mb-3" style={{ color: "var(--k-text)" }}>6. Udostępnianie danych</h2>
            <p>
              Nie sprzedajemy ani nie udostępniamy Twoich danych osobowych podmiotom trzecim w celach marketingowych.
              Dane mogą być przekazywane wyłącznie podwykonawcom technicznym (Supabase) w zakresie niezbędnym do działania aplikacji.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-medium mb-3" style={{ color: "var(--k-text)" }}>7. Kontakt</h2>
            <p>
              W sprawach związanych z ochroną danych osobowych skontaktuj się z nami:
              kengo.app.pl@gmail.com
            </p>
          </section>

        </div>

        <div className="mt-16 pt-8 border-t" style={{ borderColor: "var(--k-border)" }}>
          <a href="/" className="text-sm" style={{ color: "var(--k-accent-dark)" }}>
            Wróc do aplikacji
          </a>
        </div>

      </div>
    </div>
  );
}
