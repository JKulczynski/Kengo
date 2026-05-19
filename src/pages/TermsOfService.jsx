export default function TermsOfService() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--k-bg)", color: "var(--k-text)" }}>
      <div className="max-w-2xl mx-auto px-6 py-16">

        <div className="mb-12">
          <p className="text-sm font-medium tracking-widest uppercase mb-4" style={{ color: "var(--k-accent-dark)" }}>
            Kengo
          </p>
          <h1 className="text-3xl font-light mb-2" style={{ color: "var(--k-text)" }}>
            Regulamin
          </h1>
          <p className="text-sm" style={{ color: "var(--k-text-subtle)" }}>
            Ostatnia aktualizacja: 16 maja 2026
          </p>
        </div>

        <div className="space-y-10 text-base leading-relaxed" style={{ color: "var(--k-text-muted)" }}>

          <section>
            <h2 className="text-lg font-medium mb-3" style={{ color: "var(--k-text)" }}>1. Postanowienia ogólne</h2>
            <p>
              Niniejszy regulamin określa zasady korzystania z aplikacji Kengo, dostępnej pod adresem kengo-lilac.vercel.app
              oraz w sklepie Google Play. Operatorem aplikacji jest Jan Kulczynski (dalej: Operator).
              Korzystanie z aplikacji oznacza akceptację niniejszego regulaminu.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-medium mb-3" style={{ color: "var(--k-text)" }}>2. Opis usługi</h2>
            <p>
              Kengo to aplikacja do zarządzania projektami remontowymi. Umozliwia organizowanie dokumentów,
              faktur i gwarancji, prowadzenie notatek oraz korzystanie z asystenta AI w ramach jednego projektu.
              Aplikacja dostępna jest w wersji darmowej (ograniczone funkcje) oraz premium.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-medium mb-3" style={{ color: "var(--k-text)" }}>3. Rejestracja i konto</h2>
            <ul className="space-y-2 list-none">
              {[
                "Rejestracja wymaga podania adresu e-mail i utworzenia hasła.",
                "Użytkownik odpowiada za bezpieczenstwo swojego hasla i konta.",
                "Jedno konto przypisane jest do jednej osoby fizycznej.",
                "Operator zastrzega prawo do usunięcia konta naruszającego regulamin.",
              ].map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <span className="mt-1.5 w-1 h-1 rounded-full shrink-0" style={{ backgroundColor: "var(--k-accent)" }} />
                  {item}
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-medium mb-3" style={{ color: "var(--k-text)" }}>4. Obowiązki użytkownika</h2>
            <p className="mb-3">Uzytkownik zobowiązuje się do:</p>
            <ul className="space-y-2 list-none">
              {[
                "Korzystania z aplikacji zgodnie z prawem i niniejszym regulaminem.",
                "Nieprzesyłania treści nielegalnych, obraźliwych lub naruszających prawa osób trzecich.",
                "Niewykonywania działań mogących zakłócić działanie aplikacji.",
                "Podawania prawdziwych danych przy rejestracji.",
              ].map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <span className="mt-1.5 w-1 h-1 rounded-full shrink-0" style={{ backgroundColor: "var(--k-accent)" }} />
                  {item}
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-medium mb-3" style={{ color: "var(--k-text)" }}>5. Dane i pliki użytkownika</h2>
            <p>
              Uzytkownik zachowuje pełne prawa do swoich danych i plików przesłanych do aplikacji.
              Operator nie przetwarza ich w celach innych niż swiadczenie usługi.
              Szczegóły w Polityce Prywatności.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-medium mb-3" style={{ color: "var(--k-text)" }}>6. Ograniczenie odpowiedzialności</h2>
            <p>
              Aplikacja udostępniana jest w stanie takim, jakim jest. Operator nie gwarantuje nieprzerwanego
              dostępu do usługi ani braku błędów. Operator nie ponosi odpowiedzialności za utratę danych
              wynikającą z przyczyn lezących po stronie uzytkownika lub dostawców infrastruktury.
              Asystent AI dostarcza informacji pomocniczych i nie zastępuje porad specjalistów.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-medium mb-3" style={{ color: "var(--k-text)" }}>7. Zmiany regulaminu</h2>
            <p>
              Operator zastrzega prawo do zmiany regulaminu. O istotnych zmianach użytkownicy zostaną
              poinformowani drogą e-mail z co najmniej 14-dniowym wyprzedzeniem.
              Dalsze korzystanie z aplikacji po tym terminie oznacza akceptację nowego regulaminu.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-medium mb-3" style={{ color: "var(--k-text)" }}>8. Prawo właściwe</h2>
            <p>
              Niniejszy regulamin podlega prawu polskiemu. Wszelkie spory rozstrzygane będą przez sąd
              właściwy dla siedziby Operatora.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-medium mb-3" style={{ color: "var(--k-text)" }}>9. Kontakt</h2>
            <p>
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
