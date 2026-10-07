# Knihovna a výpůjčky

Webová aplikace, která eviduje **knihy, čtenáře a jejich výpůjčky**.
Jedna kniha může mít více výpůjček, jeden čtenář může mít více výpůjček
a každá výpůjčka patří právě jedné knize a jednomu čtenáři.

Aplikace je napsaná v čistém **HTML, CSS a JavaScriptu** (bez frameworků a bez instalace).

## Spuštění

### WebStorm
1. `File → Open…` a vyberte složku `knihovna`.
2. Pravým tlačítkem na `index.html` → **Open in → Browser** (nebo ikonka prohlížeče vpravo nahoře v editoru).

### Bez WebStormu
Stačí dvakrát kliknout na `index.html`. Internet je potřeba jen pro načtení písem Google Fonts;
bez něj se použijí systémová písma a aplikace funguje stejně.

## Struktura projektu

```
knihovna/
├── index.html          kostra stránky, jen načítá CSS a skripty
├── README.md           tento soubor
├── css/
│   └── style.css       veškerý vzhled (design tokeny, tabulky, dialogy, tmavý režim)
└── js/
    ├── storage.js      datový model, ukládání do localStorage, ukázková data
    ├── helpers.js      pomocné funkce (formát data, escapování HTML, toast)
    ├── validation.js   validační pravidla ze zadání
    ├── views.js        stav rozhraní a vykreslení záložek Knihy / Čtenáři / Výpůjčky
    ├── forms.js        dialogy: kniha, čtenář, výpůjčka, detail knihy
    └── app.js          obsluha kliknutí a spuštění aplikace
```

**Pořadí skriptů v `index.html` je důležité.** Soubory sdílejí funkce a proměnné
a každý další používá ty z předchozích. Proto se nepoužívají ES moduly
(ty by po otevření souboru přímo z disku prohlížeč zablokoval).

## Datový model

| Entita | Pole |
|--------|------|
| **Book** | `id`, `title`, `author`, `isbn`, `available_copies` |
| **Reader** | `id`, `name`, `email` |
| **Loan** | `id`, `book_id`, `reader_id`, `borrowed_at`, `due_at`, `returned_at` |

Pole `id` je navíc oproti zadání, slouží jako primární klíč pro vazby `book_id` a `reader_id`.

## Funkce

- **CRUD knih** s filtrem podle názvu nebo autora (filtruje při psaní).
- **Detail knihy** se seznamem všech jejích výpůjček.
- **Založení výpůjčky** jen tehdy, je-li dostupný výtisk (půjčením se počet sníží).
- **Vrácení knihy** (doplní `returned_at` a výtisk se vrátí mezi dostupné).
- **Výpůjčky po termínu** jsou zvýrazněné červeně, mají odznak s počtem a vlastní filtr.
- **Čtenáři** se přidávají, upravují a mažou na samostatné záložce (bez nich nejde výpůjčku založit).

## Validační pravidla

| Pravidlo | Kde je v kódu |
|----------|---------------|
| ISBN je jedinečné a má 13 znaků | `validateBook()` v `js/validation.js` |
| `available_copies` je celé číslo, nejméně 0 | `validateBook()` |
| `due_at` je později než `borrowed_at` | `validateLoan()` |
| Stejnou knihu nelze jednomu čtenáři půjčit podruhé, dokud ji nevrátil | `validateLoan()` |

Chyby se zobrazují přímo ve formuláři.

## Poznámky

- Data se ukládají do `localStorage` prohlížeče, takže zůstanou i po zavření stránky,
  ale jsou vázaná na konkrétní prohlížeč. Smazání dat prohlížeče je odstraní.
- Smazat nejde kniha ani čtenář s nevrácenou výpůjčkou. Při smazání knihy nebo čtenáře
  se smaže i jejich historie vrácených výpůjček.
- Ukázková data (3 knihy, 2 čtenáři) se vytvoří při prvním spuštění; najdete je v `js/storage.js`.
