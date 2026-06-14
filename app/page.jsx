"use client";

import Image from "next/image";
import { useMemo, useState } from "react";

const categories = [
  {
    id: "sluby",
    eyebrow: "KOLEKCJA",
    title: "Śluby",
    copy: "Pamiątki, pudełka i detale stworzone dla jednej, wyjątkowej historii.",
    image: "/images/album-hero.png",
  },
  {
    id: "urodziny",
    eyebrow: "KOLEKCJA",
    title: "Urodziny",
    copy: "Osobiste prezenty, które zachowują wspomnienia na dłużej.",
    image: "/images/gift-box.jpg",
  },
  {
    id: "wielkanoc",
    eyebrow: "KOLEKCJA SEZONOWA",
    title: "Wielkanoc",
    copy: "Naturalne dekoracje stołu i domu z imieniem lub własną dedykacją.",
    image: "/images/album-side.jpg",
  },
  {
    id: "boze-narodzenie",
    eyebrow: "KOLEKCJA SEZONOWA",
    title: "Boże Narodzenie",
    copy: "Ciepłe, drewniane upominki tworzone specjalnie dla bliskich.",
    image: "/images/album-detail.jpg",
  },
];

const products = [
  {
    name: "Album wspomnień",
    description: "Drewniana oprawa, wybrane imiona, data i tekst dedykacji.",
    price: "od 890 NOK",
    image: "/images/album-hero.png",
    tag: "PERSONALIZOWANY",
  },
  {
    name: "Pudełko na wyjątkową okazję",
    description: "Projekt dopasowany do osoby, okazji i zawartości prezentu.",
    price: "od 590 NOK",
    image: "/images/gift-box.jpg",
    tag: "NA ZAMÓWIENIE",
  },
  {
    name: "Oprawa na fotografie",
    description: "Warstwowa kompozycja z drewna z indywidualnym grawerem.",
    price: "od 790 NOK",
    image: "/images/album-detail.jpg",
    tag: "PERSONALIZOWANY",
  },
];

function ArrowIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M10 6l6 6-6 6V6z" />
    </svg>
  );
}

function BagIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M7 7V6a5 5 0 0110 0v1h3l-1 15H5L4 7h3zm2 0h6V6a3 3 0 00-6 0v1z" />
    </svg>
  );
}

export default function Home() {
  const [activeCategory, setActiveCategory] = useState("sluby");
  const [personalizing, setPersonalizing] = useState(null);

  const active = useMemo(
    () => categories.find((category) => category.id === activeCategory),
    [activeCategory],
  );

  function openCategory(id) {
    setActiveCategory(id);
    window.setTimeout(() => {
      document
        .getElementById("collection")
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 20);
  }

  return (
    <main>
      <header className="site-header">
        <a className="brand" href="#top" aria-label="Limes Dekor, strona główna">
          <span className="brand-mark">L</span>
          <span>
            <strong>LIMES</strong>
            <small>DEKOR</small>
          </span>
        </a>
        <nav aria-label="Główna nawigacja">
          <a href="#categories">Okazje</a>
          <a href="#personalization">Personalizacja</a>
          <a href="#about">O pracowni</a>
        </nav>
        <button className="bag-button" type="button" aria-label="Koszyk">
          <BagIcon />
          <span>Koszyk</span>
          <b>0</b>
        </button>
      </header>

      <section className="hero" id="top">
        <Image
          className="hero-image"
          src="/images/album-hero.png"
          alt="Personalizowany drewniany album Limes Dekor"
          fill
          priority
          sizes="100vw"
        />
        <div className="hero-scrim" />
        <div className="hero-content">
          <span className="eyebrow">RĘCZNIE TWORZONE · PERSONALIZOWANE</span>
          <h1>Piękne chwile zasługują na osobistą oprawę.</h1>
          <p>
            Tworzę drewniane dekoracje i prezenty, które opowiadają Twoją
            historię. Każdy projekt może otrzymać imię, datę lub własną
            dedykację.
          </p>
          <a className="primary-button" href="#categories">
            Wybierz okazję
            <ArrowIcon />
          </a>
        </div>
        <div className="hero-note">
          <span>01</span>
          <p>Projekt powstaje dla Ciebie, nie z gotowego szablonu.</p>
        </div>
      </section>

      <section className="occasion-section" id="categories">
        <div className="section-intro">
          <span className="eyebrow">ZNAJDŹ DEKORACJĘ</span>
          <h2>Od jakiej okazji zaczynamy?</h2>
          <p>
            Wybierz kolekcję. W środku znajdziesz bazowe projekty, które
            dopasujemy do Twoich imion, daty, kolorystyki lub krótkiej
            dedykacji.
          </p>
        </div>

        <div className="occasion-grid">
          {categories.map((category, index) => (
            <button
              className="occasion-tile"
              key={category.id}
              onClick={() => openCategory(category.id)}
              type="button"
            >
              <Image
                src={category.image}
                alt=""
                fill
                sizes="(max-width: 800px) 100vw, 50vw"
              />
              <span className="tile-scrim" />
              <span className="tile-number">0{index + 1}</span>
              <span className="tile-copy">
                <small>{category.eyebrow}</small>
                <strong>{category.title}</strong>
                <span>{category.copy}</span>
                <b>
                  Zobacz kolekcję <ArrowIcon />
                </b>
              </span>
            </button>
          ))}
        </div>
      </section>

      <section className="collection-section" id="collection">
        <div className="collection-header">
          <div>
            <span className="eyebrow">{active.eyebrow}</span>
            <h2>{active.title}</h2>
          </div>
          <div className="category-switcher" aria-label="Zmień kolekcję">
            {categories.map((category) => (
              <button
                className={category.id === activeCategory ? "active" : ""}
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                type="button"
              >
                {category.title}
              </button>
            ))}
          </div>
        </div>

        <div className="product-grid">
          {products.map((product) => (
            <article className="product-card" key={product.name}>
              <div className="product-image">
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  sizes="(max-width: 800px) 100vw, 33vw"
                />
                <span>{product.tag}</span>
              </div>
              <div className="product-copy">
                <div>
                  <h3>{product.name}</h3>
                  <p>{product.description}</p>
                </div>
                <strong>{product.price}</strong>
              </div>
              <button
                className="product-action"
                onClick={() => setPersonalizing(product)}
                type="button"
              >
                Personalizuj projekt
                <ArrowIcon />
              </button>
            </article>
          ))}
        </div>
      </section>

      <section className="personalization" id="personalization">
        <div className="personalization-photo">
          <Image
            src="/images/album-side.jpg"
            alt="Detal drewnianej oprawy wykonywanej na zamówienie"
            fill
            sizes="(max-width: 800px) 100vw, 50vw"
          />
        </div>
        <div className="personalization-copy">
          <span className="eyebrow">TWÓJ POMYSŁ · MOJE WYKONANIE</span>
          <h2>To nie jest zwykły produkt z półki.</h2>
          <p className="lead">
            Po wyborze wzoru podajesz treść, okazję i swoje życzenia. Przed
            wykonaniem otrzymasz projekt do akceptacji.
          </p>
          <ol>
            <li>
              <b>01</b>
              <span>
                <strong>Wybierz bazowy projekt</strong>
                Zacznij od formy, która najlepiej pasuje do okazji.
              </span>
            </li>
            <li>
              <b>02</b>
              <span>
                <strong>Dodaj własne szczegóły</strong>
                Wpisz imiona, datę, dedykację i wybierz wariant wykończenia.
              </span>
            </li>
            <li>
              <b>03</b>
              <span>
                <strong>Zaakceptuj wizualizację</strong>
                Nic nie trafia do wykonania bez Twojej akceptacji.
              </span>
            </li>
          </ol>
        </div>
      </section>

      <section className="payment-strip">
        <div>
          <span className="eyebrow">PROSTO I BEZPIECZNIE</span>
          <h2>Zapłać tak, jak Ci wygodnie.</h2>
        </div>
        <div className="payment-methods">
          <span>Stripe</span>
          <span>Link</span>
          <span>Vipps</span>
          <small>Płatności kartą i szybki checkout</small>
        </div>
      </section>

      <footer id="about">
        <div>
          <span className="footer-logo">LIMES DEKOR</span>
          <p>
            Dziękuję za Twój czas i uwagę. Tworzę dekoracje, które zostają z
            bliskimi na dłużej.
          </p>
        </div>
        <div>
          <small>KONTAKT</small>
          <a href="mailto:studio@limes-interior.no">
            studio@limes-interior.no
          </a>
          <a href="tel:+4794712654">+47 947 12 654</a>
        </div>
        <div>
          <small>PRACOWNIA</small>
          <p>Finnestadveien 371<br />1880 Eidsberg, Norway</p>
        </div>
      </footer>

      {personalizing && (
        <div className="modal-backdrop" role="presentation">
          <section
            aria-labelledby="personalization-title"
            aria-modal="true"
            className="modal"
            role="dialog"
          >
            <button
              className="modal-close"
              onClick={() => setPersonalizing(null)}
              type="button"
              aria-label="Zamknij"
            >
              ×
            </button>
            <span className="eyebrow">PERSONALIZACJA</span>
            <h2 id="personalization-title">{personalizing.name}</h2>
            <p>
              Wpisz dane, które mają pojawić się na projekcie. Ostateczny układ
              wyślemy do akceptacji przed wykonaniem.
            </p>
            <label>
              Imiona lub nazwa
              <input placeholder="np. Anna i Tomasz" />
            </label>
            <label>
              Data lub okazja
              <input placeholder="np. 14.08.2026" />
            </label>
            <label>
              Dedykacja
              <textarea
                placeholder="Krótki tekst, który ma znaleźć się na dekoracji"
                rows="3"
              />
            </label>
            <button className="primary-button full" type="button">
              Dodaj projekt do zamówienia
              <ArrowIcon />
            </button>
            <small className="modal-note">
              Kwota zostanie pobrana przez Stripe Link lub Vipps dopiero przy
              finalizacji zamówienia.
            </small>
          </section>
        </div>
      )}
    </main>
  );
}
