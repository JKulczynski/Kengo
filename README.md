# Kengo

Aplikacja do zarządzania projektami remontowymi dla polskich użytkowników. Pomaga planować remonty, przechowywać dokumenty, śledzić gwarancje, zarządzać budżetem i współpracować z zespołem.

## Cel MVP

1. Jedno miejsce na projekty i dokumenty (zamiast maili, folderów i Excela)
2. Szybkie znalezienie rzeczy, gdy są potrzebne (umowa, faktura, gwarancja, zdjęcie)
3. Minimum funkcji, które realnie da się używać regularnie

## Funkcje

- **Projekty** — tworzenie i śledzenie projektów remontowych; każdy projekt ma 4 zakładki:
  - **Finanse** — budżet, wydatki, postęp kosztowy
  - **Harmonogram** — zadania z możliwością odhaczenia, priorytetem i deadline'em
  - **Galeria** — zdjęcia powiązane z projektem
  - **Zespół** — współpracownicy przypisani do danego projektu
- **Dokumenty** — wgrywanie faktur, paragonów, umów i zdjęć z automatycznym rozpoznawaniem AI (OCR) — faktury są parsowane i kategoryzowane automatycznie
- **Gwarancje** — śledzenie dat wygaśnięcia gwarancji produktów (wykrywane automatycznie przy wgraniu dokumentu z datą końca gwarancji)
- **Notatki** — szybkie notatki tekstowe i głosowe (nagrywanie głosu), niepowiązane bezpośrednio z pojedynczym projektem
- **Wyszukiwanie AI** — inteligentne wyszukiwanie po projektach i dokumentach
- **Zespół** — zapraszanie współpracowników z zarządzaniem rolami (na poziomie całego konta, niezależnie od zespołu per-projekt)
- **Asystent AI** — czat z asystentem remontowym, odpowiada w języku wybranym w interfejsie (PL/EN)
- **Dwujęzyczność** — pełne UI po polsku i angielsku, przełącznik w profilu i stopce
- **PWA (Progressive Web App)** — apkę można zainstalować na telefonie (Android/iOS) bezpośrednio z przeglądarki, bez Google Play/App Store — wystarczy otworzyć link i wybrać "Dodaj do ekranu głównego"
- **Zgoda na cookies (RODO)** — analytics (GA4, Clarity) ładują się dopiero po akceptacji banera

## Technologie

- **Frontend:** React 18, Vite, Tailwind CSS, shadcn/ui, framer-motion
- **Routing:** React Router v6
- **Powiadomienia:** Sonner (toast)
- **Daty:** date-fns z polską lokalizacją
- **i18n:** react-i18next (polski / angielski, przełącznik w apce)
- **Backend/Auth:** Supabase (Postgres + RLS, Auth, Storage, Edge Functions — AI OCR dokumentów przez `invoke-llm`)
- **PWA:** vite-plugin-pwa, instalowalna na Android/iOS
- **Analytics:** Google Analytics 4, Vercel Analytics, Microsoft Clarity, własne eventy produktowe w Supabase
- **Deploy:** Vercel — auto-deploy z brancha `main` w repo `JKulczynski/Kengo`

## Live

**https://kengo-lilac.vercel.app/**

## Uruchomienie lokalne

Wymaga pliku `.env` ze zmiennymi Supabase (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`) — projekt Supabase trzeba założyć osobno, backend nie działa bez własnej instancji.

```bash
npm install
npm run dev
```

Serwer deweloperski Vite startuje na `http://localhost:5173`, ale pełna wersja produkcyjna (z wdrożonymi Supabase Edge Functions) działa pod adresem Vercel powyżej.

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
│   ├── Login.jsx         # Logowanie / rejestracja (Supabase Auth)
│   ├── Dashboard.jsx     # Pulpit główny
│   ├── Projects.jsx      # Lista projektów
│   ├── ProjectDetail.jsx # Szczegóły projektu — zakładki Finanse/Harmonogram/Galeria/Zespół
│   ├── Documents.jsx     # Biblioteka dokumentów z filtrami
│   ├── Warranties.jsx    # Menedżer gwarancji
│   ├── Upload.jsx        # Wgrywanie dokumentów z AI
│   ├── Search.jsx        # Wyszukiwanie AI
│   ├── Notes.jsx         # Notatki tekstowe i głosowe
│   ├── Team.jsx          # Zarządzanie zespołem (poziom konta)
│   ├── Profile.jsx       # Profil użytkownika, przełącznik języka
│   ├── Assistant.jsx     # Asystent AI (czat)
│   ├── PrivacyPolicy.jsx # Polityka prywatności (wymagana do PWA/publikacji)
│   └── TermsOfService.jsx # Regulamin
├── locales/              # pl.json, en.json — klucze tłumaczeń i18next
├── hooks/                # use-mobile, use-toast
└── utils.js              # createPageUrl i inne helpery
```

## Konwencje kodu

- Teksty UI przez klucze i18n (domyślny język: **polski**, dostępny też angielski)
- Waluty: zawsze `{value.toLocaleString('pl-PL')} zł` niezależnie od wybranego języka UI (apka działa w PLN)
- Daty: `dd.MM.yyyy` lub `d MMM` z `{ locale: pl }` z `date-fns/locale`
- Toasty: `import { toast } from 'sonner'` — Toaster zamontowany w `App.jsx`
- Ikony: `lucide-react`
- i18n: `useTranslation()` z `react-i18next`, klucze w `src/locales/pl.json` / `en.json`, wybór języka zapisany w `localStorage`

## Status i najbliższe kroki

MVP jest live i testowane z prawdziwymi użytkownikami (nie tylko wewnętrznie). Otwarty backlog:

- Dopracowanie jakości AI-skanu dokumentów
- Ręczne dodawanie wydatku bez przechodzenia przez skan AI
- Zdjęcie/wizualizacja projektu na karcie projektu
- Export budżetu projektu do PDF/Excel
- Zakładka z danymi inwestora (adres inwestycji, kontakt) w jednym miejscu
- Integracja z Google Drive (auto-sync folderu) — odłożona do potwierdzenia realnej potrzeby po szerszych testach
- Rekrutacja testerów i zbieranie feedbacku (segmenty: osoby remontujące się, early adopterzy, architekci/biura projektowe)
