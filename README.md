# Kengo

Aplikacja do zarządzania projektami remontowymi dla polskich użytkowników. Pomaga planować remonty, przechowywać dokumenty, śledzić gwarancje, zarządzać budżetem i współpracować z zespołem.

## Cel MVP

1. Jedno miejsce na projekty i dokumenty (zamiast maili, folderów i Excela)
2. Szybkie znalezienie rzeczy, gdy są potrzebne (umowa, faktura, gwarancja, zdjęcie)
3. Minimum funkcji, które realnie da się używać regularnie

## Funkcje

- **Projekty** — tworzenie, edycja i śledzenie projektów remontowych z budżetem i postępem
- **Dokumenty** — wgrywanie faktur, paragonów, umów i zdjęć z automatycznym rozpoznawaniem AI
- **Gwarancje** — śledzenie dat wygaśnięcia gwarancji produktów
- **Notatki** — szybkie notatki tekstowe i głosowe powiązane z projektami
- **Wyszukiwanie AI** — inteligentne wyszukiwanie po projektach i dokumentach
- **Zespół** — zapraszanie współpracowników do projektów z zarządzaniem rolami
- **Asystent AI** — czat z asystentem remontowym

## Technologie

- **Frontend:** React 18, Vite, Tailwind CSS, shadcn/ui, framer-motion
- **Routing:** React Router v6
- **Powiadomienia:** Sonner (toast)
- **Daty:** date-fns z polską lokalizacją
- **Backend/Auth:** Base44 platform (entities, integrations, auth)
- **Deploy:** Vercel — auto-deploy z brancha `main` w repo `JKulczynski/Kengo`

## Uruchomienie lokalne

```bash
npm install
npm run dev
```

Aplikacja uruchamia się na `http://localhost:5173`.

```bash
npm run build   # wersja produkcyjna
```

## Struktura projektu

```
src/
├── api/                  # Klienty API (entities, integrations, auth)
├── components/
│   ├── dashboard/        # Widżety pulpitu (ActiveProjects, RecentDocuments, QuickActions, StatsCards)
│   ├── documents/        # DeleteConfirmationDialog
│   ├── notes/            # NoteCard, VoiceRecorder
│   ├── projects/         # ProjectCard, ProjectForm, DeleteConfirmationDialog
│   ├── search/           # SearchBar, SearchResults, SuggestedSearches, SearchResultItem
│   ├── upload/           # FileUploadZone, ProcessingQueue, DocumentPreview
│   └── ui/               # Komponenty shadcn/ui
├── pages/
│   ├── Layout.jsx        # Główny layout z nawigacją boczną
│   ├── Dashboard.jsx     # Pulpit główny
│   ├── Projects.jsx      # Lista i szczegóły projektów
│   ├── Documents.jsx     # Biblioteka dokumentów z filtrami
│   ├── Warranties.jsx    # Menedżer gwarancji
│   ├── Upload.jsx        # Wgrywanie dokumentów z AI
│   ├── Search.jsx        # Wyszukiwanie AI
│   ├── Notes.jsx         # Notatki tekstowe i głosowe
│   ├── Team.jsx          # Zarządzanie zespołem
│   ├── Profile.jsx       # Profil użytkownika
│   └── Assistant.jsx     # Asystent AI (czat)
├── hooks/                # use-mobile, use-toast
└── utils.js              # createPageUrl i inne helpery
```

## Konwencje kodu

- Wszystkie teksty UI w języku **polskim**
- Waluty: `{value.toLocaleString('pl-PL')} zł`
- Daty: `dd.MM.yyyy` lub `d MMM` z `{ locale: pl }` z `date-fns/locale`
- Toasty: `import { toast } from 'sonner'` — Toaster zamontowany w `App.jsx`
- Ikony: `lucide-react`
- Brak i18n library — plain Polish strings

## Najbliższe kroki (po MVP)

- Onboarding nowych użytkowników
- Error boundary (zapobieganie crashom całej aplikacji)
- Przepływ akceptacji zaproszenia do zespołu
- Optymalizacja rozmiaru bundle (code splitting)
- Testy (manualne + automatyczne)
