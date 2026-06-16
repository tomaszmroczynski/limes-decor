export const categories = [
  {
    id: "sluby",
    eyebrow: { no: "KOLLEKSJON", pl: "KOLEKCJA" },
    title: { no: "Bryllup", pl: "Śluby" },
    copy: {
      no: "Minner, esker og detaljer laget for én personlig historie.",
      pl: "Pamiątki, pudełka i detale stworzone dla jednej, wyjątkowej historii.",
    },
    image: "/images/album-hero.png",
  },
  {
    id: "urodziny",
    eyebrow: { no: "KOLLEKSJON", pl: "KOLEKCJA" },
    title: { no: "Bursdag", pl: "Urodziny" },
    copy: {
      no: "Personlige gaver som tar vare på øyeblikkene litt lenger.",
      pl: "Osobiste prezenty, które zachowują wspomnienia na dłużej.",
    },
    image: "/images/gift-box.jpg",
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
];

export const products = [
  {
    id: "wedding-memory-album",
    category: "sluby",
    templateId: "sample-album",
    name: { no: "Minnealbum", pl: "Album wspomnień" },
    description: {
      no: "Treetui med navn, dato og en kort personlig tekst.",
      pl: "Drewniana oprawa z imionami, datą i krótką dedykacją.",
    },
    price: 890,
    image: "/images/album-hero.png",
    tag: { no: "PERSONLIG", pl: "PERSONALIZOWANY" },
    delivery: { no: "2-3 uker", pl: "2-3 tygodnie" },
  },
  {
    id: "birthday-gift-box",
    category: "urodziny",
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
    delivery: { no: "2-3 uker", pl: "2-3 tygodnie" },
    requiresDimensions: true,
  },
  {
    id: "easter-photo-frame",
    category: "wielkanoc",
    templateId: "sample-album",
    name: { no: "Ramme for fotografier", pl: "Oprawa na fotografie" },
    description: {
      no: "En lagdelt dekorasjon med plass til en kort høytidstekst.",
      pl: "Warstwowa dekoracja z miejscem na świąteczny tekst.",
    },
    price: 790,
    image: "/images/album-detail.jpg",
    tag: { no: "PERSONLIG", pl: "PERSONALIZOWANY" },
    delivery: { no: "10-14 dager", pl: "10-14 dni" },
  },
  {
    id: "christmas-keepsake-box",
    category: "boze-narodzenie",
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
