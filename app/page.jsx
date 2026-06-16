"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";

import { categories, products } from "../lib/catalog/data";
import { localize, ui } from "../lib/catalog/i18n";
import {
  calculateCartTotal,
  calculateProductTotal,
  formatPrice,
} from "../lib/pricing";

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
  const [locale, setLocale] = useState("no");
  const [activeCategory, setActiveCategory] = useState("sluby");
  const [personalizing, setPersonalizing] = useState(null);
  const [cartOpen, setCartOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [cartItems, setCartItems] = useState([]);
  const [checkoutForm, setCheckoutForm] = useState({
    email: "",
    phone: "",
    consentTerms: false,
    consentPrivacy: false,
    consentNoReturn: false,
    consentMarketing: false,
  });
  const [checkoutState, setCheckoutState] = useState({
    loading: false,
    error: "",
    orderNo: "",
  });
  const [preview, setPreview] = useState({
    svg: "",
    loading: false,
    metadata: null,
    error: "",
  });
  const [form, setForm] = useState({
    names: "",
    occasionDate: "",
    dedication: "",
    dimensions: "",
    express: false,
    giftWrap: false,
  });

  const active = useMemo(
    () => categories.find((category) => category.id === activeCategory),
    [activeCategory],
  );
  const copy = ui[locale];

  const filteredProducts = useMemo(
    () => products.filter((product) => product.category === activeCategory),
    [activeCategory],
  );

  const cartTotal = useMemo(() => calculateCartTotal(cartItems), [cartItems]);

  useEffect(() => {
    if (!personalizing) {
      setPreview({ svg: "", loading: false, metadata: null, error: "" });
      return;
    }

    const names = form.names.trim();
    const dedication = form.dedication.trim();

    if (!names || !dedication) {
      setPreview({
        svg: "",
        loading: false,
        metadata: null,
        error: "missing_required_text",
      });
      return;
    }

    const controller = new AbortController();
    setPreview((current) => ({ ...current, loading: true, error: "" }));

    fetch("/api/render-preview", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        productId: personalizing.id,
        values: {
          names,
          dedication,
        },
      }),
      signal: controller.signal,
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("preview_failed");
        }

        return response.json();
      })
      .then((result) => {
        setPreview({
          svg: result.svg,
          loading: false,
          metadata: result.metadata,
          error: "",
        });
      })
      .catch((error) => {
        if (error.name === "AbortError") {
          return;
        }

        setPreview({
          svg: "",
          loading: false,
          metadata: null,
          error: "preview_failed",
        });
      });

    return () => controller.abort();
  }, [form.dedication, form.names, personalizing]);

  function openCategory(id) {
    setActiveCategory(id);
    window.setTimeout(() => {
      document
        .getElementById("collection")
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 20);
  }

  function openPersonalization(product) {
    setPersonalizing(product);
    setForm({
      names: "",
      occasionDate: "",
      dedication: "",
      dimensions: "",
      express: false,
      giftWrap: false,
    });
  }

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function addToCart() {
    if (!personalizing || !form.names.trim() || !form.dedication.trim()) {
      return;
    }

    if (personalizing.requiresDimensions && !form.dimensions.trim()) {
      return;
    }

    setCartItems((items) => [
      ...items,
      {
        id: `${personalizing.id}-${Date.now()}`,
        product: personalizing,
        options: {
          ...form,
          names: form.names.trim(),
          dedication: form.dedication.trim(),
          occasionDate: form.occasionDate.trim(),
          dimensions: form.dimensions.trim(),
        },
      },
    ]);
    setPersonalizing(null);
    setCartOpen(true);
  }

  function removeCartItem(id) {
    setCartItems((items) => items.filter((item) => item.id !== id));
  }

  function updateCheckoutField(field, value) {
    setCheckoutForm((current) => ({ ...current, [field]: value }));
  }

  async function submitCheckout() {
    if (
      !checkoutForm.email.trim() ||
      !checkoutForm.consentTerms ||
      !checkoutForm.consentPrivacy ||
      !checkoutForm.consentNoReturn
    ) {
      setCheckoutState({
        loading: false,
        error: copy.checkoutError,
        orderNo: "",
      });
      return;
    }

    setCheckoutState({
      loading: true,
      error: "",
      orderNo: "",
    });

    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          locale,
          email: checkoutForm.email.trim(),
          phone: checkoutForm.phone.trim(),
          consents: {
            terms: checkoutForm.consentTerms,
            privacy: checkoutForm.consentPrivacy,
            personalizedNoReturn: checkoutForm.consentNoReturn,
            marketing: checkoutForm.consentMarketing,
          },
          items: cartItems.map((item) => ({
            productId: item.product.id,
            options: item.options,
          })),
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        const errorMessage =
          result.error === "database_not_configured"
            ? copy.checkoutDbMissing
            : copy.checkoutError;

        setCheckoutState({
          loading: false,
          error: errorMessage,
          orderNo: "",
        });
        return;
      }

      setCheckoutState({
        loading: false,
        error: "",
        orderNo: result.orderNo,
      });
      setCartItems([]);

      if (result.stripeUrl) {
        window.location.href = result.stripeUrl;
      }
    } catch (_error) {
      setCheckoutState({
        loading: false,
        error: copy.checkoutError,
        orderNo: "",
      });
    }
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
          <a href="#categories">{copy.navOccasions}</a>
          <a href="#personalization">{copy.navPersonalization}</a>
          <a href="#about">{copy.navAbout}</a>
        </nav>
        <div className="header-actions">
          <div className="language-switcher" aria-label="Language">
            <button
              className={locale === "no" ? "active" : ""}
              onClick={() => setLocale("no")}
              type="button"
            >
              NO
            </button>
            <button
              className={locale === "pl" ? "active" : ""}
              onClick={() => setLocale("pl")}
              type="button"
            >
              PL
            </button>
          </div>
          <button
            className="menu-button"
            type="button"
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            onClick={() => setMenuOpen((open) => !open)}
          >
            {copy.menu}
          </button>
          <button
            className="bag-button"
            type="button"
            aria-label="Koszyk"
            onClick={() => setCartOpen(true)}
          >
            <BagIcon />
            <span>{copy.cart}</span>
            <b>{cartItems.length}</b>
          </button>
        </div>
        {menuOpen && (
          <div className="mobile-menu" id="mobile-menu">
            <a href="#categories" onClick={() => setMenuOpen(false)}>{copy.navOccasions}</a>
            <a href="#personalization" onClick={() => setMenuOpen(false)}>{copy.navPersonalization}</a>
            <a href="#about" onClick={() => setMenuOpen(false)}>{copy.navAbout}</a>
          </div>
        )}
      </header>

      <section className="hero" id="top">
        <Image
          className="hero-image"
          src="/images/album-hero.png"
          alt="Personalizowany drewniany album Limes Dekor"
          fill
          priority
          loading="eager"
          sizes="100vw"
        />
        <div className="hero-scrim" />
        <div className="hero-content">
          <span className="eyebrow">{copy.heroEyebrow}</span>
          <h1>{copy.heroTitle}</h1>
          <p>{copy.heroCopy}</p>
          <a className="primary-button" href="#categories">
            {copy.chooseOccasion}
            <ArrowIcon />
          </a>
        </div>
        <div className="hero-note">
          <span>01</span>
          <p>{copy.formRule}</p>
        </div>
      </section>

      <section className="occasion-section" id="categories">
        <div className="section-intro">
          <span className="eyebrow">{copy.categoriesEyebrow}</span>
          <h2>{copy.categoriesTitle}</h2>
          <p>{copy.categoriesCopy}</p>
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
                <small>{localize(category.eyebrow, locale)}</small>
                <strong>{localize(category.title, locale)}</strong>
                <span>{localize(category.copy, locale)}</span>
                <b>
                  {copy.seeCollection} <ArrowIcon />
                </b>
              </span>
            </button>
          ))}
        </div>
      </section>

      <section className="collection-section" id="collection">
        <div className="collection-header">
          <div>
            <span className="eyebrow">{localize(active.eyebrow, locale)}</span>
            <h2>{localize(active.title, locale)}</h2>
          </div>
          <div className="category-switcher" aria-label={copy.changeCollection}>
            {categories.map((category) => (
              <button
                className={category.id === activeCategory ? "active" : ""}
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                type="button"
              >
                {localize(category.title, locale)}
              </button>
            ))}
          </div>
        </div>

        <div className="product-grid">
          {filteredProducts.map((product) => (
            <article className="product-card" key={product.id}>
              <div className="product-image">
                <Image
                  src={product.image}
                  alt={localize(product.name, locale)}
                  fill
                  sizes="(max-width: 800px) 100vw, 33vw"
                />
                <span>{localize(product.tag, locale)}</span>
              </div>
              <div className="product-copy">
                <div>
                  <h3>{localize(product.name, locale)}</h3>
                  <p>{localize(product.description, locale)}</p>
                  <small>{copy.delivery}: {localize(product.delivery, locale)}</small>
                </div>
                <strong>{formatPrice(product.price)}</strong>
              </div>
              <button
                className="product-action"
                onClick={() => openPersonalization(product)}
                type="button"
              >
                {copy.personalize}
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
          <span className="eyebrow">{copy.personalizationEyebrow}</span>
          <h2>{copy.personalizationTitle}</h2>
          <p className="lead">{copy.personalizationLead}</p>
          <ol>
            <li>
              <b>01</b>
              <span>
                <strong>{copy.step1Title}</strong>
                {copy.step1Copy}
              </span>
            </li>
            <li>
              <b>02</b>
              <span>
                <strong>{copy.step2Title}</strong>
                {copy.step2Copy}
              </span>
            </li>
            <li>
              <b>03</b>
              <span>
                <strong>{copy.step3Title}</strong>
                {copy.step3Copy}
              </span>
            </li>
          </ol>
        </div>
      </section>

      <section className="payment-strip">
        <div>
          <span className="eyebrow">{copy.paymentEyebrow}</span>
          <h2>{copy.paymentTitle}</h2>
        </div>
        <div className="payment-methods">
          <span>Stripe</span>
          <span>Link</span>
          <span>Vipps</span>
          <small>{copy.paymentNote}</small>
        </div>
      </section>

      <footer id="about">
        <div>
          <span className="footer-logo">LIMES DEKOR</span>
          <p>{copy.footerCopy}</p>
        </div>
        <div>
          <small>{copy.contact}</small>
          <a href="mailto:studio@limes-interior.no">
            studio@limes-interior.no
          </a>
          <a href="tel:+4794712654">+47 947 12 654</a>
        </div>
        <div>
          <small>{copy.studio}</small>
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
            <span className="eyebrow">{copy.modalEyebrow}</span>
            <h2 id="personalization-title">{localize(personalizing.name, locale)}</h2>
            <p>{copy.modalCopy}</p>
            <label>
              {copy.names}
              <input
                value={form.names}
                onChange={(event) => updateField("names", event.target.value)}
                placeholder={copy.namesPlaceholder}
              />
            </label>
            <label>
              {copy.date}
              <input
                value={form.occasionDate}
                onChange={(event) =>
                  updateField("occasionDate", event.target.value)
                }
                placeholder={copy.datePlaceholder}
              />
            </label>
            <label>
              {copy.dedication}
              <textarea
                value={form.dedication}
                onChange={(event) =>
                  updateField("dedication", event.target.value)
                }
                placeholder={copy.dedicationPlaceholder}
                rows="3"
              />
            </label>
            {personalizing.requiresDimensions && (
              <label>
                {copy.dimensions}
                <input
                  value={form.dimensions}
                  onChange={(event) =>
                    updateField("dimensions", event.target.value)
                  }
                  placeholder={copy.dimensionsPlaceholder}
                />
              </label>
            )}
            <div className="production-preview">
              <div className="preview-header">
                <span>{copy.previewTitle}</span>
                <small>
                  {preview.loading
                    ? copy.previewLoading
                    : preview.metadata?.requiresReview
                      ? copy.previewReview
                      : preview.svg
                        ? copy.previewReady
                        : copy.previewMissing}
                </small>
              </div>
              {preview.svg ? (
                <div
                  className="preview-canvas"
                  dangerouslySetInnerHTML={{ __html: preview.svg }}
                />
              ) : (
                <div className="preview-placeholder">
                  {copy.previewPlaceholder}
                </div>
              )}
              {preview.metadata?.requiresReview && (
                <small className="preview-warning">
                  {copy.previewReviewNote}
                </small>
              )}
            </div>
            <div className="paid-options">
              <label>
                <input
                  checked={form.express}
                  onChange={(event) =>
                    updateField("express", event.target.checked)
                  }
                  type="checkbox"
                />
                {copy.express} <span>+300 NOK</span>
              </label>
              <label>
                <input
                  checked={form.giftWrap}
                  onChange={(event) =>
                    updateField("giftWrap", event.target.checked)
                  }
                  type="checkbox"
                />
                {copy.giftWrap} <span>+90 NOK</span>
              </label>
            </div>
            <div className="modal-summary">
              <span>{copy.total}</span>
              <strong>{formatPrice(calculateProductTotal(personalizing, form))}</strong>
            </div>
            <button className="primary-button full" onClick={addToCart} type="button">
              {copy.addToCart}
              <ArrowIcon />
            </button>
            <small className="modal-note">{copy.modalNote}</small>
          </section>
        </div>
      )}
      {cartOpen && (
        <aside className="cart-drawer" aria-label="Koszyk">
          <button
            className="modal-close"
            onClick={() => setCartOpen(false)}
            type="button"
            aria-label="Zamknij koszyk"
          >
            ×
          </button>
          <span className="eyebrow">KOSZYK</span>
          <h2>{copy.cartTitle}</h2>
          {cartItems.length === 0 ? (
            <p className="empty-cart">{copy.emptyCart}</p>
          ) : (
            <>
              <div className="cart-items">
                {cartItems.map((item) => (
                  <article className="cart-item" key={item.id}>
                    <div>
                      <strong>{localize(item.product.name, locale)}</strong>
                      <span>{item.options.names}</span>
                      <small>{item.options.dedication}</small>
                      {item.options.dimensions && (
                        <small>{copy.dimensions}: {item.options.dimensions}</small>
                      )}
                    </div>
                    <div>
                      <b>{formatPrice(calculateProductTotal(item.product, item.options))}</b>
                      <button type="button" onClick={() => removeCartItem(item.id)}>
                        {copy.remove}
                      </button>
                    </div>
                  </article>
                ))}
              </div>
              <div className="cart-total">
                <span>{copy.grossTotal}</span>
                <strong>{formatPrice(cartTotal)}</strong>
              </div>
              <div className="checkout-form">
                <label>
                  {copy.email}
                  <input
                    type="email"
                    value={checkoutForm.email}
                    onChange={(event) =>
                      updateCheckoutField("email", event.target.value)
                    }
                    placeholder={copy.emailPlaceholder}
                  />
                </label>
                <label>
                  {copy.phone}
                  <input
                    type="tel"
                    value={checkoutForm.phone}
                    onChange={(event) =>
                      updateCheckoutField("phone", event.target.value)
                    }
                    placeholder={copy.phonePlaceholder}
                  />
                </label>
                <label className="checkbox-row">
                  <input
                    type="checkbox"
                    checked={checkoutForm.consentTerms}
                    onChange={(event) =>
                      updateCheckoutField("consentTerms", event.target.checked)
                    }
                  />
                  <span>{copy.consentTerms}</span>
                </label>
                <label className="checkbox-row">
                  <input
                    type="checkbox"
                    checked={checkoutForm.consentPrivacy}
                    onChange={(event) =>
                      updateCheckoutField("consentPrivacy", event.target.checked)
                    }
                  />
                  <span>{copy.consentPrivacy}</span>
                </label>
                <label className="checkbox-row">
                  <input
                    type="checkbox"
                    checked={checkoutForm.consentNoReturn}
                    onChange={(event) =>
                      updateCheckoutField("consentNoReturn", event.target.checked)
                    }
                  />
                  <span>{copy.consentNoReturn}</span>
                </label>
                <label className="checkbox-row">
                  <input
                    type="checkbox"
                    checked={checkoutForm.consentMarketing}
                    onChange={(event) =>
                      updateCheckoutField("consentMarketing", event.target.checked)
                    }
                  />
                  <span>{copy.consentMarketing}</span>
                </label>
              </div>
              <button
                className="primary-button full"
                type="button"
                onClick={submitCheckout}
                disabled={checkoutState.loading}
              >
                {checkoutState.loading ? copy.checkoutSaving : copy.checkout}
                <ArrowIcon />
              </button>
              {checkoutState.error && (
                <small className="checkout-feedback error">
                  {checkoutState.error}
                </small>
              )}
              {checkoutState.orderNo && (
                <small className="checkout-feedback success">
                  {copy.orderSaved}: {copy.orderSavedNote} {checkoutState.orderNo}
                </small>
              )}
              <small className="modal-note">{copy.checkoutNote}</small>
            </>
          )}
        </aside>
      )}
    </main>
  );
}
