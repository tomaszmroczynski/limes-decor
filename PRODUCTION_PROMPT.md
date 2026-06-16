# Limes Dekor — Prompt produkcyjny

> Dokument do przekazania zespołowi deweloperskiemu lub agentowi kodującemu.
> Opisuje pełny system sklepu z produktami personalizowanymi, którego **sercem
> jest deterministyczny generator pliku produkcyjnego SVG dla LightBurn**.

---

## 0. Rola i cel

Jesteś inżynierem budującym sklep e-commerce **Limes Dekor** — jednoosobowej
pracowni rękodzieła w Norwegii (Anna Rasinska, Eidsberg). Sklep sprzedaje
**gotowe formy produktów**, które klient **personalizuje treścią** (imiona, data,
dedykacja). Po wprowadzeniu tekstu i opłaceniu zamówienia system **generuje
gotowy do graweru plik SVG dla LightBurn** — bezbłędny, deterministyczny,
zgodny 1:1 z podglądem, który zaakceptował klient.

Zasada naczelna systemu:

```
Forma jest moja. Treść jest Twoja.
```

Brak ręcznych rund akceptacji projektu. Podgląd jest generowany automatycznie i
**jest umową**. Człowiek interweniuje wyłącznie przy wyjątkach (status
`Do weryfikacji`).

### Najważniejsza zasada techniczna

```
Tekst renderujemy kodem (wektory), nigdy modelem obrazowym.
Ten sam silnik renderuje podgląd klienta i plik produkcyjny.
Wejście identyczne ⇒ wyjście identyczne (determinizm).
```

---

## 1. Stack

```
Next.js 16 (App Router, server actions)
PostgreSQL + Prisma (lub Drizzle)
Auth.js (magic link) — konto opcjonalne
Stripe Checkout / Link (potem Vipps MobilePay)
S3-compatible storage (pliki prywatne)
Resend / Postmark (maile transakcyjne, SPF/DKIM/DMARC)
Sentry, Docker, GitHub Actions, Watchtower

Rendering wektorów (krytyczne):
- opentype.js  (tekst → ścieżki vector, pomiar szerokości glifów)   ← zalecane
  lub text-to-svg (wrapper na opentype.js)
- resvg / sharp (SVG → PNG dla podglądu rastrowego na stronie)
- lokalne, wersjonowane pliki fontów (.ttf/.otf) w repo
```

OpenAI/AI **tylko pomocniczo**: propozycje dedykacji, kontrola długości tekstu,
sugestie skrócenia, mockupy lifestyle. **Nigdy** do finalnego renderu tekstu i
nigdy nie udaje napisu na mockupie. Nie wysyłaj danych osobowych (imion,
dedykacji) do zewnętrznego AI bez zgody/anonimizacji.

---

## 2. MODUŁ KLUCZOWY — Generator pliku produkcyjnego SVG dla LightBurn

To najważniejszy element. Buduj go najpierw i testuj najdokładniej.

### 2.1 Wejście

```
- product_id + template_version
- wartości pól personalizacji (tekst, data, dedykacja, liczby)
- wymiary indywidualne (jeśli produkt wymaga)
- font_id + font_version (z szablonu)
- opcje: pakowanie, ekspres (nie wpływają na SVG, tylko na zlecenie)
```

### 2.2 Definicja szablonu produktu (template)

Każdy produkt ma szablon opisujący geometrię i reguły renderu:

```
canvas_width_mm, canvas_height_mm        # fizyczny rozmiar pola roboczego
origin                                     # punkt (0,0) zgodny z jigiem w pracowni
mirror: bool                               # lustrzane odbicie (np. grawer od spodu)
text_boxes: [
  {
    id, x_mm, y_mm, width_mm, height_mm    # prostokąt na tekst
    align: left|center|right
    valign: top|middle|bottom
    font_id, font_version
    size_min_pt, size_max_pt               # zakres auto-dopasowania
    line_height
    max_lines
    max_chars
    transform: none|uppercase|capitalize
    operation: fill|line                   # grawer wypełnieniem czy linią
    layer_color                            # kolor = warstwa LightBurn (patrz 2.4)
  }
]
graphics: [ ... ]                          # stałe elementy formy (ramki, linie)
cut_paths: [ ... ]                         # ścieżki cięcia, jeśli forma jest cięta
registration_frame: { ... }               # ramka pozycjonująca (warstwa Tool)
material, default_engrave_notes
```

### 2.3 Pipeline renderu (deterministyczny)

```
1. Walidacja wejścia (długość, znaki, wymagane pola, wymiary).
2. Normalizacja tekstu (transform, trim, NFC dla diakrytyków).
3. Łamanie linii do width_mm i max_lines.
4. Auto-dopasowanie rozmiaru: zmniejszaj font od size_max_pt do size_min_pt,
   aż tekst mieści się w boxie (szerokość mierzona opentype.js advanceWidth,
   wysokość = liczba_linii × line_height).
5. Jeśli przy size_min_pt nadal się nie mieści → NIE renderuj na siłę,
   ustaw flagę requires_review = true z powodem "tekst za długi".
6. Konwersja każdej linii tekstu na ŚCIEŻKI wektorowe (opentype getPath),
   pozycjonowanie wg align/valign w mm.
7. Złożenie SVG: artwork tekstu + graphics + cut_paths + registration_frame.
8. Zastosowanie mirror, jeśli ustawione.
9. Walidacja wyjścia (patrz 2.6).
10. Zapis: SVG produkcyjny + PNG podglądu + metadane (wersje, hash).
```

### 2.4 Wymagania SVG zgodne z LightBurn

```
- Jednostki: width="{W}mm" height="{H}mm" na <svg>, viewBox="0 0 {W} {H}"
  tak, by 1 jednostka użytkownika = 1 mm (eliminuje problem 72/96 DPI w imporcie).
- Tekst ZAWSZE jako <path> (outline), NIGDY <text> — niezależność od fontów
  zainstalowanych w LightBurn i pełna wierność.
- Spłaszczone transformacje (bake transforms) — żadnych zagnieżdżonych
  transform/scale, które LightBurn może źle zinterpretować.
- Brak clipPath, filtrów, masek, gradientów. Czysta geometria.
- Mapowanie operacji na KOLOR = WARSTWA (Anna ma zapisane ustawienia per kolor):
    #000000  → Fill / grawer wypełnieniem (tekst, grafika)
    #FF0000  → Line / cięcie na wylot
    #0000FF  → Line / score / linia gięcia
  (paleta konfigurowalna w ustawieniach; udokumentować w README pracowni.)
- Ramka pozycjonująca na warstwie nie-wyjściowej (LightBurn "Tool" T1 / kolor
  oznaczony jako output:off), żeby Anna miała odniesienie do jiga, ale laser
  jej nie wypalał.
- Fille: zamknięte ścieżki z fill, regułą fill-rule="nonzero".
- Linie: stroke z hairline; szerokość stroke i tak ignorowana przez Line
  (laser jedzie po centerline) — udokumentować to.
```

### 2.5 Determinizm i wierność (podgląd = produkcja)

```
- Plik produkcyjny i obraz podglądu pochodzą z TEJ SAMEJ funkcji render(input).
- Fonty wersjonowane i commitowane do repo; render przypina font_version.
- Wersje bibliotek renderujących przypięte (lockfile).
- Snapshot zamówienia zamraża: input, SVG, PNG, template_version, font_version,
  hash SVG, wersję regulaminu. Zmiana szablonu/ceny w przyszłości NIE zmienia
  istniejących zamówień.
- Test złoty (golden): render(input) → porównanie geometrii/hash ze wzorcem.
```

### 2.6 Reguły tekstu i przypadki brzegowe (bo nie ma człowieka w pętli)

```
- Diakrytyki NO/PL: ø æ å Ø Æ Å ł ż ó ś ć ń ę ą — font MUSI mieć te glify;
  test pokrycia glifów przy starcie (fail-fast, jeśli brak).
- Znak spoza fontu (.notdef) → requires_review = "nieobsługiwany znak".
- Emoji / znaki kontrolne → odrzucenie na walidacji wejścia.
- Bardzo długie słowo bez spacji > width_mm → requires_review (nie tnij słowa).
- Przekroczenie max_lines po łamaniu → requires_review.
- Tekst pusty w polu wymaganym → błąd walidacji (nie zamówienie).
- Białe znaki: trim brzegów, redukcja wielokrotnych spacji.
```

### 2.7 Ograniczenia graweru (production constraints w szablonie)

```
- font_min_size_pt dobrane pod czytelność graweru na danym materiale.
- Dla cienkich linii / małych rozmiarów rozważ font jednoliniowy (stick/stencil)
  + operation: line, zamiast fill.
- Minimalna grubość elementu wypełnianego (żeby grawer się nie zlewał).
- Kerning kontrolowany; przy małych rozmiarach minimalny odstęp między glifami.
- mirror per materiał (np. grawer od spodu akrylu).
```

### 2.8 Wyjście

```
- {order_no}-{line}.svg     (produkcyjny, do LightBurn)   — storage prywatny
- {order_no}-{line}.png     (podgląd dla klienta i admina)
- metadata.json             (input, wersje, hash, requires_review, powód)
- opcjonalnie: eksport PDF/DXF (LightBurn importuje oba)
```

---

## 3. Model danych

### Produkt
```
nazwa, slug, kategoria, opis_krótki, opis_pełny
cena_bazowa, waluta=NOK
zdjęcia[]
status: szkic|aktywny|ukryty
czas_realizacji
czy_personalizowany, czy_wymaga_wymiarów, czy_wymaga_pliku
czy_pozwala_ekspres, czy_pozwala_pakowanie
template_id (→ szablon renderu z sekcji 2.2)
```
Brak: wariantu materiału, dowolnego projektu, wariantu rozmiaru jako opcji,
dodatkowych elementów dekoracyjnych. Wymiar = dane techniczne, nie wariant.

### Pole personalizacji
```
nazwa, typ: tekst|długi_tekst|data|liczba|plik
czy_wymagane, limit_znaków, podpowiedź, widoczność_na_podglądzie
mapowanie → text_box w szablonie
```

### Kategorie
```
Śluby, Urodziny, Święta Wielkanocne, Boże Narodzenie
(później: Rocznice, Chrzest/komunia, Prezenty firmowe, Inne)
Kategoria MUSI realnie filtrować produkty (nie kosmetycznie).
```

### Zamówienie + pozycja (snapshot)
```
order_no (czytelny, nie UUID), status, kwoty, MVA, zgody[]
pozycja: produkt_snapshot, personalizacja_snapshot, svg_ref, png_ref,
         template_version, font_version, requires_review, powód,
         ilość, personalizacja_per_sztuka?  (patrz 3.1)
```

### 3.1 Ilość vs personalizacja per sztuka
Decyzja produktowa do zaimplementowania: czy „ilość 5" = ten sam tekst ×5,
czy 5 osobnych personalizacji (np. 5 pudełek ślubnych z różnymi imionami).
Dla ślubów/firmowych potrzebne **pozycje per sztuka** — każda generuje własny SVG.

---

## 4. Podgląd dla klienta

```
Klient wpisuje dane → na żywo widzi render: "Tak będzie wyglądał Twój napis".
To podgląd informacyjny (= umowa), nie negocjacja projektu.
Render z tego samego silnika co plik produkcyjny (PNG z SVG).
Jeśli requires_review → komunikat, że zamówienie przejdzie ręczną weryfikację.
```

---

## 5. Silnik ceny

```
cena = cena_bazowa
     + dopłata_za_przekroczenie_limitu_tekstu (jeśli produkt dopuszcza)
     + ekspres
     + pakowanie_prezentowe
     + niestandardowy_wymiar (jeśli produkt wymaga)
     × ilość
Hook na: kody rabatowe i karty podarunkowe (zarezerwuj w modelu).
Ceny B2C prezentowane BRUTTO (z MVA 25%).
```

---

## 6. Checkout i płatności

```
Guest checkout; konto opcjonalne po zakupie; magic link do zamówienia.
Checkout zbiera: email, telefon, dostawa, personalizacja, zgody, płatność.
Płatność: Stripe Checkout / Link (potem Vipps). MVP = 100% z góry.
Webhooki (idempotentne! Stripe wysyła duplikaty):
  payment succeeded | failed | expired | refund | cancellation
Okno edycji personalizacji: krótkie, póki status = Opłacone/Do weryfikacji.
Wznawianie porzuconego checkoutu (magic link / zapis lokalny) + opcjonalny mail.
```

---

## 7. Statusy i workflow

```
Nowe → Oczekuje na płatność → Opłacone → [Do weryfikacji] →
W produkcji → Gotowe do wysyłki → Wysłane → Zakończone
Pozostałe: Anulowane, Reklamacja
```
`Do weryfikacji` tylko dla wyjątków z renderu (sekcja 2.6) lub uwag klienta.

**Logika anulowania/zwrotu (custom = bez angrerett):**
```
Darmowe anulowanie tylko dopóki status ∈ {Opłacone, Do weryfikacji}
(przed "W produkcji"). Po starcie produkcji brak zwrotu.
Reguła wymuszana w kodzie i pokazana klientowi przed zakupem.
```

---

## 8. Panel admina

```
Moduły: Dashboard, Produkty, Kategorie, Zamówienia, Personalizacje, Pliki,
Klienci, Płatności, Faktury, Wysyłka, Zgody, Dokumenty prawne, Tłumaczenia,
Ustawienia realizacji, Użytkownicy admina, Audit log.
Widoki zamówień: Nowe, Do weryfikacji, W produkcji, Do wysyłki, Wysłane, Reklamacje.
Logowanie admina: email+hasło, 2FA docelowo; role: admin/manager.
```

### 8.1 Most zamówienie → pracownia (codzienne serce operacji)
```
Przy zamówieniu admin widzi: produkt, zdjęcie, podgląd personalizacji, tekst,
wymiary, pliki klienta, pakowanie, ekspres, płatność, status, zgody, historię.
Przycisk "Paczka produkcyjna" (jeden klik):
  → plik SVG do LightBurn (+ opcjonalnie PDF/DXF)
  → arkusz zlecenia do druku (produkt, tekst, wymiary, pakowanie, ekspres, termin)
  → kolejka/widok wsadowy produkcji
```

---

## 9. Powiadomienia

```
Matryca (wielojęzyczna, na start NO + PL, docelowo + EN):
Zamówienie złożone | Płatność potwierdzona | Przyjęte do realizacji |
Produkcja rozpoczęta | Gotowe do wysyłki | Wysłane | Anulowane | Reklamacja przyjęta
Provider z poprawnym SPF/DKIM/DMARC.
```

---

## 10. Pliki / storage

```
Pliki klienta i pliki produkcyjne → storage PRYWATNY (nie public/).
Wymagania: limit rozmiaru, dozwolone typy, walidacja MIME, kontrola
bezpieczeństwa, czasowe linki dostępu, retencja.
RODO: automatyczne kasowanie plików klienta po X miesiącach od Zakończenia;
workflow eksportu/usunięcia danych na żądanie (DSAR).
```

---

## 11. Obłożenie i terminy (pracownia jednoosobowa)

```
Ustawienia: czas realizacji per produkt/kategoria, limit zamówień/tydzień,
daty wyłączone, tryb sezonowy, deadline zamówień świątecznych.
EGZEKWOWANIE przy checkout (nie tylko ustawienie):
  - limit wyczerpany / po deadline → dynamiczna zmiana ETA,
  - automatyczne wyłączenie ekspresu, gdy niewykonalny,
  - w skrajności zamknięcie zamówień z komunikatem.
Klient widzi: "Przewidywana realizacja: 2-3 tygodnie. Szacowana wysyłka: {data}".
```

---

## 12. Wysyłka

```
MVP ręcznie: koszt, metoda, numer śledzenia wpisywany przez admina, mail z trackingiem.
Później: Bring/Posten, punkty odbioru, etykiety.
```

---

## 13. MVA, faktury, księgowość (Norwegia — obowiązkowe)

```
MVA 25%; ceny B2C brutto. Faktura/kvittering z nr org. 925 621 102.
Retencja księgowa wg bokføringsloven (zwykle 5 lat).
Próg rejestracji MVA: 50 000 NOK obrotu — przełącznik "MVA aktywne".
Moduł Faktury w adminie + eksport do księgowości (Fiken/Tripletex/PowerOffice
lub CSV opłaconych zamówień). B2B (prezenty firmowe) później.
```

---

## 14. Zgody, prawo, RODO, dostępność

```
Osobne checkboxy w checkout (marketingowy NIE domyślnie zaznaczony):
  - Akceptuję regulamin.
  - Zapoznałem/am się z polityką prywatności.
  - Rozumiem, że produkt personalizowany może nie podlegać standardowemu
    zwrotowi po rozpoczęciu realizacji.
  - Chcę otrzymywać informacje marketingowe. (opcjonalny)
Rejestr zgód: email/user_id, order_id, typ, wersja_dokumentu, treść, data, IP,
  user_agent, źródło, czy_wycofana, data_wycofania.
Dokumenty: regulamin, polityka prywatności, polityka cookies,
  informacja o produktach personalizowanych, informacja o zwrotach i reklamacjach.
Cookie banner (CMP) + bramkowanie skryptów analitycznych/marketingowych (Consent Mode).
Dostępność: WCAG 2.1 AA — w Norwegii wymóg prawny (universell utforming).
  Modale: focus-trap, Escape, blokada scrolla tła, etykiety ARIA.
```

---

## 15. Wielojęzyczność

```
Główny: norweski. MVP: NO + PL. Docelowo: NO + PL + EN.
Tłumaczenia: produkty, kategorie, checkout, maile, dokumenty prawne,
statusy zamówień, panel klienta.
```

---

## 16. Infrastruktura, testy, SEO

```
Środowiska: produkcja + staging. Zmienne środowiskowe / sekrety.
Backup bazy i plików. Sentry. Audit log.
Testy: checkout, webhooki (idempotencja!), GOLDEN TEST generatora SVG
  (render(input) == wzorzec), pokrycie glifów fontu, przypadki brzegowe tekstu.
SEO: metadane, sitemap, dane strukturalne Product, Open Graph images.
```

---

## 17. Kryteria akceptacji (Definition of Done)

```
[ ] Kategorie realnie filtrują produkty.
[ ] Koszyk: dodawanie, usuwanie, ilość, podsumowanie.
[ ] Personalizacja zapisuje dane; podgląd na żywo z silnika produkcyjnego.
[ ] Generator SVG: tekst→ścieżki, mm, kolory=warstwy, ramka Tool,
    auto-fit, mirror, diakrytyki NO/PL, golden test przechodzi.
[ ] Podgląd PNG i SVG produkcyjny pochodzą z tej samej funkcji (wierność).
[ ] Snapshot zamówienia zamraża input + SVG + wersje + zgody.
[ ] requires_review kieruje zamówienie do "Do weryfikacji" z powodem.
[ ] Stripe Checkout + webhooki idempotentne; MVP 100% z góry.
[ ] Statusy + reguła anulowania (przed produkcją) wymuszone w kodzie.
[ ] Admin: "Paczka produkcyjna" generuje SVG + arkusz zlecenia.
[ ] MVA 25%, faktura z nr org., ceny brutto.
[ ] Zgody z pełnym rejestrem; cookie banner; WCAG 2.1 AA (modale).
[ ] Pliki w prywatnym storage; retencja + DSAR.
[ ] i18n NO+PL; maile wielojęzyczne; SPF/DKIM/DMARC.
[ ] Obłożenie egzekwowane przy checkout; ETA pokazywane klientowi.
[ ] Ciemny styl Limes na całej stronie (w tym sekcja produktów); sticky header; mobile menu.
```

---

## 18. Kolejność prac

```
1.  Front Priorytet 0: kategorie filtrują, koszyk, ciemna sekcja produktów,
    sticky header, mobile menu.
2.  i18n: NO + PL.
3.  Baza danych + modele (produkt, szablon, pola, zamówienie, snapshot).
4.  GENERATOR SVG do LightBurn (sekcja 2) + golden testy.   ← najpierw silnik
5.  Podgląd na żywo z tego samego silnika.
6.  Silnik ceny.
7.  Guest checkout.
8.  Stripe Checkout + webhooki idempotentne.
9.  MVA + faktury (legalnie wystawione pierwsze zamówienie).
10. Statusy + logika anulowania.
11. Panel admina: zamówienia + "Paczka produkcyjna".
12. Panel admina: produkty + szablony renderu.
13. Zgody + dokumenty prawne + cookie banner + dostępność.
14. Maile transakcyjne (NO/PL).
15. Storage plików + retencja + DSAR.
16. Obłożenie pracowni + ETA (egzekwowane przy checkout).
17. Wysyłka + tracking.
18. Vipps.
19. Staging, backup, Sentry, testy, SEO.
```

---

## 19. Najważniejsze decyzje (niezmienne)

```
- Brak ręcznych rund akceptacji projektu.
- Brak wyboru materiału, brak dowolnego projektowania przez klienta.
- Forma produktu narzucona; treść personalizacji od klienta.
- Podgląd generowany automatycznie i jest umową.
- Plik produkcyjny SVG = ten sam render co podgląd, deterministyczny,
  tekst jako ścieżki, gotowy do importu w LightBurn.
- Człowiek interweniuje tylko przy wyjątkach (Do weryfikacji).
```
