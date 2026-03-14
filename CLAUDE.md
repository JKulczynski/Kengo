# Kengo — instrukcje dla Claude

## Kontekst projektu

Aplikacja do zarządzania remontami dla polskich użytkowników. Nazwa: **Kengo**.
Repo: `JKulczynski/Kengo` na GitHub. Deploy: Vercel (auto z brancha `main`).
Backend: Base44 platform (entities, integrations, auth) — dostęp przez `@/api/`.

## Język

**Wszystkie teksty UI muszą być po polsku.** Bez wyjątków — etykiety, przyciski, placeholdery, puste stany, komunikaty błędów, potwierdzenia.

## Kluczowe konwencje

### Waluta
```jsx
{value.toLocaleString('pl-PL')} zł   // poprawnie
${value.toLocaleString()}             // NIGDY — brak dolara w polskiej aplikacji
```

### Daty
```jsx
import { format } from 'date-fns';
import { pl } from 'date-fns/locale';

format(date, 'dd.MM.yyyy')               // pełna data
format(date, 'd MMM', { locale: pl })    // skrócona z miesiącem
```

### Toasty (powiadomienia)
```jsx
import { toast } from 'sonner';

toast.success('Zapisano');
toast.error('Błąd zapisu. Spróbuj ponownie.');
```
`<SonnerToaster />` jest zamontowany w `App.jsx` — nie dodawaj drugiego.

### Ikony
Tylko `lucide-react`.

### Routing
`createPageUrl(pageName)` z `@/utils` generuje ścieżki. Nie hardcoduj ścieżek.

## Struktura plików

- `src/pages/` — strony (Layout, Dashboard, Projects, Documents, Warranties, Upload, Search, Notes, Team, Profile, Assistant)
- `src/components/dashboard/` — widżety pulpitu
- `src/components/projects/` — karty i formularze projektów
- `src/components/upload/` — strefa uploadu i podgląd
- `src/components/search/` — wyszukiwarka i wyniki
- `src/components/notes/` — notatki i nagrywanie głosu
- `src/api/entities.js` — modele danych (Project, Document, Note, User, ProjectMember, Warranty)
- `src/api/integrations.js` — UploadFile, InvokeLLM, SendEmail, ExtractDataFromUploadedFile

## Obsługa błędów

Każda strona powinna mieć:
1. Stan `error` + `setError(null)` na początku `loadData()`
2. Komunikat błędu z przyciskiem "Spróbuj ponownie" wywołującym `loadData()`
3. Wzorzec:
```jsx
{error && (
  <div className="mb-8 p-4 bg-red-50 rounded-xl border border-red-100 flex items-center justify-between">
    <p className="text-red-600 text-sm">{error}</p>
    <Button size="sm" variant="outline" onClick={loadData} className="ml-4 text-sm">
      Spróbuj ponownie
    </Button>
  </div>
)}
```

## Puste stany

Rozróżniaj dwa przypadki:
- Brak danych w ogóle → "Brak X. Dodaj pierwszy X."
- Dane są, ale filtry nie zwracają wyników → "Brak wyników dla wybranych filtrów. Wyczyść filtry."

## Nazwy statusów (polskie)

| Klucz | Wyświetlana nazwa |
|-------|-------------------|
| planning | Planowanie |
| in_progress | W trakcie |
| on_hold | Wstrzymany |
| completed | Ukończony |

## Co NIE jest w zakresie MVP

- i18n library (react-intl, i18next) — plain Polish strings wystarczą
- Pełny audit dostępności (a11y)
- CSRF/XSS — brak własnego backendu
- Code splitting / optymalizacja bundle

## Przed pushem

Zawsze uruchom `npm run build` i upewnij się, że kończy się `✓ built in`.
