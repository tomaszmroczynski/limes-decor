// Ceny produktów oznaczonych // CENA PLACEHOLDER są tymczasowe — do potwierdzenia.
const P = "/images/products";

export const categories = [
  {
    id: "sluby",
    eyebrow: { no: "KOLLEKSJON", pl: "KOLEKCJA" },
    title: { no: "Bryllup", pl: "Śluby" },
    copy: {
      no: "Minner, esker og detaljer laget for én personlig historie.",
      pl: "Pamiątki, pudełka i detale stworzone dla jednej, wyjątkowej historii.",
    },
    image: `${P}/slub+urodziny+rocznice__album-wspomnien__01.png`,
  },
  {
    id: "urodziny",
    eyebrow: { no: "KOLLEKSJON", pl: "KOLEKCJA" },
    title: { no: "Bursdag", pl: "Urodziny" },
    copy: {
      no: "Personlige gaver som tar vare på øyeblikkene litt lenger.",
      pl: "Osobiste prezenty, które zachowują wspomnienia na dłużej.",
    },
    image: `${P}/inne__szkatulka-pszczola__01.png`,
  },
  {
    id: "rocznice",
    eyebrow: { no: "KOLLEKSJON", pl: "KOLEKCJA" },
    title: { no: "Jubileum", pl: "Rocznice" },
    copy: {
      no: "Varige minner for de store øyeblikkene.",
      pl: "Trwałe pamiątki na najważniejsze rocznice.",
    },
    image: `${P}/urodziny+rocznice__pudelko-na-prezent__01.png`,
  },
  {
    id: "dzieci",
    eyebrow: { no: "KOLLEKSJON", pl: "KOLEKCJA" },
    title: { no: "Barn", pl: "Dzieci" },
    copy: {
      no: "Fargerike trefigurer som barn er glad i.",
      pl: "Kolorowe drewniane figury, które kochają dzieci.",
    },
    image: `${P}/dzieci__wieloryb__01.png`,
  },
  {
    id: "wielkanoc",
    eyebrow: { no: "SESONGKOLLEKSJON", pl: "KOLEKCJA SEZONOWA" },
    title: { no: "Påske", pl: "Wielkanoc" },
    copy: {
      no: "Naturlige dekorasjoner til hjem og bord med navn eller egen tekst.",
      pl: "Naturalne dekoracje stołu i domu z imieniem lub własną dedykacją.",
    },
    image: "/images/album-side.jpg",
  },
  {
    id: "boze-narodzenie",
    eyebrow: { no: "SESONGKOLLEKSJON", pl: "KOLEKCJA SEZONOWA" },
    title: { no: "Jul", pl: "Boże Narodzenie" },
    copy: {
      no: "Varme treprodukter laget spesielt for mennesker du er glad i.",
      pl: "Ciepłe, drewniane upominki tworzone specjalnie dla bliskich.",
    },
    image: "/images/album-detail.jpg",
  },
  {
    id: "firmowe",
    eyebrow: { no: "KOLLEKSJON", pl: "KOLEKCJA" },
    title: { no: "Bedriftsgaver", pl: "Prezenty firmowe" },
    copy: {
      no: "Personlige gaver for kunder og ansatte.",
      pl: "Personalizowane upominki dla klientów i pracowników.",
    },
    image: `${P}/inne+firmowe__pudelko-na-wino__01.png`,
  },
  {
    id: "inne",
    eyebrow: { no: "KOLLEKSJON", pl: "KOLEKCJA" },
    title: { no: "Annet", pl: "Inne" },
    copy: {
      no: "Dekorasjoner og esker for enhver anledning.",
      pl: "Dekoracje i pudełka na każdą okazję.",
    },
    image: `${P}/inne__szkatulka-zaglowiec__01.png`,
  },
];

const TAG_PERSONAL = { no: "PERSONLIG", pl: "PERSONALIZOWANY" };
const TAG_DECOR = { no: "DEKORASJON", pl: "DEKORACJA" };
const DELIVERY_STD = { no: "2-3 uker", pl: "2-3 tygodnie" };

export const products = [
  {
    id: "wedding-memory-album",
    categories: ["sluby", "urodziny", "rocznice"],
    templateId: "sample-album",
    name: { no: "Minnealbum", pl: "Album wspomnień" },
    description: {
      no: "Treetui med navn, dato og en kort personlig tekst.",
      pl: "Drewniana oprawa z imionami, datą i krótką dedykacją.",
    },
    price: 890,
    image: `${P}/slub+urodziny+rocznice__album-wspomnien__01.png`,
    images: [
      `${P}/slub+urodziny+rocznice__album-wspomnien__01.png`,
      `${P}/slub+urodziny+rocznice__album-wspomnien__02.png`,
    ],
    tag: TAG_PERSONAL,
    delivery: DELIVERY_STD,
  },
  {
    id: "bee-keepsake-box",
    categories: ["urodziny", "inne"],
    templateId: "sample-album",
    name: { no: "Bie-eske", pl: "Szkatułka z pszczołą" },
    description: {
      no: "Sekskantet treeske med bie-motiv og messinghank.",
      pl: "Heksagonalna szkatułka z motywem pszczoły i mosiężnym uchwytem.",
    },
    price: 690, // CENA PLACEHOLDER
    image: `${P}/inne__szkatulka-pszczola__01.png`,
    images: [
      `${P}/inne__szkatulka-pszczola__01.png`,
      `${P}/inne__szkatulka-pszczola__02.png`,
    ],
    tag: TAG_PERSONAL,
    delivery: DELIVERY_STD,
  },
  {
    id: "anniversary-gift-box",
    categories: ["urodziny", "rocznice"],
    templateId: "sample-album",
    name: { no: "Gaveeske med dedikasjon", pl: "Pudełko na prezent" },
    description: {
      no: "Høy treeske med gravert dedikasjon på fronten.",
      pl: "Wysokie pudełko z grawerowaną dedykacją na froncie.",
    },
    price: 490, // CENA PLACEHOLDER
    image: `${P}/urodziny+rocznice__pudelko-na-prezent__01.png`,
    tag: TAG_PERSONAL,
    delivery: DELIVERY_STD,
  },
  {
    id: "wine-box",
    categories: ["inne", "firmowe"],
    templateId: "sample-album",
    name: { no: "Vineske", pl: "Pudełko na wino" },
    description: {
      no: "Åpenarbeidet treeske for én flaske, med valgfritt motiv.",
      pl: "Ażurowe pudełko na jedną butelkę, z wybranym motywem.",
    },
    price: 290, // CENA PLACEHOLDER
    image: `${P}/inne+firmowe__pudelko-na-wino__01.png`,
    tag: TAG_PERSONAL,
    delivery: DELIVERY_STD,
    requiresDimensions: true,
  },
  {
    id: "flower-crate",
    categories: ["sluby", "inne"],
    templateId: "sample-album",
    name: { no: "Blomsterkasse", pl: "Skrzynka na kwiaty" },
    description: {
      no: "Treeske med tauhank og dekorativt utskåret mønster.",
      pl: "Drewniana skrzynka ze sznurkowym uchwytem i ażurowym wzorem.",
    },
    price: 350, // CENA PLACEHOLDER
    image: `${P}/slub+inne__skrzynka-na-kwiaty__01.png`,
    tag: TAG_DECOR,
    delivery: DELIVERY_STD,
  },
  {
    id: "tissue-box",
    categories: ["inne"],
    templateId: "sample-album",
    name: { no: "Servietteske", pl: "Pudełko na chusteczki" },
    description: {
      no: "Dekorativt trekk for servietter med utskåret mønster.",
      pl: "Dekoracyjna osłona na chusteczki z ażurowym wzorem.",
    },
    price: 250, // CENA PLACEHOLDER
    image: `${P}/inne__pudelko-na-chusteczki__01.png`,
    tag: TAG_DECOR,
    delivery: DELIVERY_STD,
  },
  {
    id: "ship-keepsake-box",
    categories: ["inne"],
    templateId: "sample-album",
    name: { no: "Eske med seilskip", pl: "Szkatułka z żaglowcem" },
    description: {
      no: "Treeske med gravert seilskip og dekorativ kant.",
      pl: "Drewniana szkatułka z grawerem żaglowca i ozdobną ramką.",
    },
    price: 590, // CENA PLACEHOLDER
    image: `${P}/inne__szkatulka-zaglowiec__01.png`,
    tag: TAG_PERSONAL,
    delivery: DELIVERY_STD,
  },
  {
    id: "pirate-ship",
    categories: ["dzieci"],
    templateId: "sample-album",
    name: { no: "Piratskip", pl: "Statek piracki" },
    description: {
      no: "Trefigur av et piratskip i flere lag.",
      pl: "Warstwowa drewniana figura statku pirackiego.",
    },
    price: 450, // CENA PLACEHOLDER
    image: `${P}/dzieci__statek-piracki__01.png`,
    tag: TAG_DECOR,
    delivery: DELIVERY_STD,
  },
  {
    id: "jellyfish",
    categories: ["dzieci"],
    templateId: "sample-album",
    name: { no: "Manet", pl: "Meduza" },
    description: {
      no: "Fargerik, lagdelt manet på akrylstativ.",
      pl: "Kolorowa, warstwowa meduza na akrylowej podstawie.",
    },
    price: 390, // CENA PLACEHOLDER
    image: `${P}/dzieci__meduza__01.png`,
    tag: TAG_DECOR,
    delivery: DELIVERY_STD,
  },
  {
    id: "octopus",
    categories: ["dzieci"],
    templateId: "sample-album",
    name: { no: "Blekksprut", pl: "Ośmiornica" },
    description: {
      no: "Fargerik, lagdelt blekksprut i tre.",
      pl: "Kolorowa, warstwowa ośmiornica z drewna.",
    },
    price: 390, // CENA PLACEHOLDER
    image: `${P}/dzieci__osmiornica__01.png`,
    tag: TAG_DECOR,
    delivery: DELIVERY_STD,
  },
  {
    id: "seahorse",
    categories: ["dzieci"],
    templateId: "sample-album",
    name: { no: "Sjøhest", pl: "Konik morski" },
    description: {
      no: "Fargerike, lagdelte sjøhester i tre.",
      pl: "Kolorowe, warstwowe koniki morskie z drewna.",
    },
    price: 390, // CENA PLACEHOLDER
    image: `${P}/dzieci__konik-morski__01.png`,
    tag: TAG_DECOR,
    delivery: DELIVERY_STD,
  },
  {
    id: "whale",
    categories: ["dzieci"],
    templateId: "sample-album",
    name: { no: "Hval", pl: "Wieloryb" },
    description: {
      no: "Fargerik, lagdelt hval i tre på stativ.",
      pl: "Kolorowy, warstwowy wieloryb z drewna na podstawie.",
    },
    price: 390, // CENA PLACEHOLDER
    image: `${P}/dzieci__wieloryb__01.png`,
    tag: TAG_DECOR,
    delivery: DELIVERY_STD,
  },
  {
    id: "dolphin",
    categories: ["dzieci"],
    templateId: "sample-album",
    name: { no: "Delfin", pl: "Delfin" },
    description: {
      no: "Fargerik, lagdelt delfin i tre.",
      pl: "Kolorowy, warstwowy delfin z drewna.",
    },
    price: 390, // CENA PLACEHOLDER
    image: `${P}/dzieci__delfin__01.png`,
    tag: TAG_DECOR,
    delivery: DELIVERY_STD,
  },
  {
    id: "birthday-gift-box",
    categories: ["urodziny"],
    templateId: "sample-album",
    name: {
      no: "Gaveeske for en spesiell anledning",
      pl: "Pudełko na wyjątkową okazję",
    },
    description: {
      no: "En fast form med personlig dedikasjon til én mottaker.",
      pl: "Gotowa forma pudełka z dedykacją dla jednej osoby.",
    },
    price: 590,
    image: "/images/gift-box.jpg",
    tag: { no: "PÅ BESTILLING", pl: "NA ZAMÓWIENIE" },
    delivery: DELIVERY_STD,
    requiresDimensions: true,
  },
  {
    id: "easter-photo-frame",
    categories: ["wielkanoc"],
    templateId: "sample-album",
    name: { no: "Ramme for fotografier", pl: "Oprawa na fotografie" },
    description: {
      no: "En lagdelt dekorasjon med plass til en kort høytidstekst.",
      pl: "Warstwowa dekoracja z miejscem na świąteczny tekst.",
    },
    price: 790,
    image: "/images/album-detail.jpg",
    tag: TAG_PERSONAL,
    delivery: { no: "10-14 dager", pl: "10-14 dni" },
  },
  {
    id: "christmas-keepsake-box",
    categories: ["boze-narodzenie"],
    templateId: "sample-album",
    name: { no: "Juleeske for minner", pl: "Świąteczne pudełko pamiątkowe" },
    description: {
      no: "En ferdig treform med din egen korte dedikasjon.",
      pl: "Drewniane pudełko z gotowym układem i własną dedykacją.",
    },
    price: 690,
    image: "/images/album-side.jpg",
    tag: { no: "JUL", pl: "BOŻE NARODZENIE" },
    delivery: { no: "2-4 uker", pl: "2-4 tygodnie" },
    requiresDimensions: true,
  },
];
