# KENGO — MVP

MVP aplikacji, która pomaga ogarnąć chaos wokół budowy / remontu.

Na tym etapie skupiamy się na roli **organizera**: dokumenty, projekty, podstawowe widoki i proste “zarządzanie porządkiem”.
Bez porad eksperckich i bez “magicznych” kosztorysów.

## Cel MVP

1) Jedno miejsce na projekty i dokumenty (zamiast maili, folderów i Excela)
2) Szybkie znalezienie rzeczy, gdy są potrzebne (umowa, faktura, gwarancja, zdjęcie)
3) Minimum funkcji, które realnie da się używać regularnie

## Co działa w tej wersji (obecny zakres)

- Dashboard (podgląd najważniejszych rzeczy)
- Projects (lista / tworzenie / widok projektu — zależnie od stanu implementacji)
- Documents (widoki dokumentów — zależnie od stanu implementacji)
- Warranties (manager gwarancji na podstawie dokumentów z datą końca gwarancji)

> Uwaga: lokalnie używamy mocków API (DEV), żeby odpalić apkę bez zewnętrznego backendu.

## Wymagania

- Node.js (najlepiej aktualne LTS)
- npm (instaluje się razem z Node)

## Uruchomienie lokalnie (DEV)

W terminalu, w folderze repo:

npm install
npm run dev

Po starcie wejdź w przeglądarce na:
http://localhost:5173/

## Backend (stan na dziś)

W trybie DEV (localhost) aplikacja działa na lokalnych mockach API (plik: `src/api/apiClient.js`).

Backend produkcyjny nie jest jeszcze podpięty.

## Najbliższe kroki

- Opisać krótko ekrany + modele danych (MVP docs)
- Domknąć kod i dokończyć odpinanie od starego dostawcy backendu
- Testy (manualne + automatyczne)


"wymuszenie przebudowy z nowymi zmiennymi"