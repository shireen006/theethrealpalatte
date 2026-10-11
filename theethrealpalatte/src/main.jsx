import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  Search,
  Heart,
  Menu,
  X,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
} from "lucide-react";

import crochetHero from "./images/crochet-hero.jpg";
import paintingHero from "./images/painting-hero.jpeg";
import sunflowerbouquet from "./images/sunflowerbouquet.jpg";
import sunflowerkeychain from "./images/keychain.jpg";
import fourleafcloverkeychain from "./images/fourleafcloverkeychain.jpg";
import butterflyhairtie from "./images/butterflyhairtie.jpg";
import bowhairtie from "./images/bowhairtie.jpeg";

import "./styles.css";
import { BUSINESS_CONFIG, getWhatsAppOrderUrl } from "./config.js";

const slides = [
  {
    eyebrow: "HANDMADE",
    title: "Crochet",
    text: "Little pieces, made slowly.",
    image: crochetHero,
    alt: "Handmade crochet collection",
    filter: "Crochet",
  },
  {
    eyebrow: "ORIGINAL ART",
    title: "Paintings",
    text: "Colours, stories & little moments.",
    image: paintingHero,
    alt: "Original handmade paintings",
    filter: "Paintings",
  },
];

const products = [
  {
    id: 1,
    name: "Crochet Sunflower Bouquet",
    price: 350,
    type: "Crochet",
    image: sunflowerbouquet,
    description:
      "Handmade sunshine, just for you.\nA cheerful crochet sunflower bouquet made with love and soft yarn.",
  },
  {
    id: 2,
    name: "Crochet Flower Keychains",
    price: 130,
    type: "Crochet",
    image: sunflowerkeychain,
    description:
      "A tiny handmade flower for your everyday essentials.\nPerfect for keys, bags, or gifting.\n[Customization available in multiple colors.]",
  },
  {
    id: 3,
    name: "Four Leaf Clover Keychain",
    price: 150,
    type: "Crochet",
    image: fourleafcloverkeychain,
    description:
      "A little handmade lucky charm.\nCarry a touch of luck wherever you go, crafted with delicate stitching.",
  },
  {
    id: 4,
    name: "Butterfly Hairtie",
    price: 250,
    type: "Crochet",
    image: butterflyhairtie,
    description:
      "A delicate butterfly made to brighten your hairstyle.\nHandmade with soft crochet details and durable elastic.",
  },
  {
    id: 5,
    name: "Crochet Bow Clip",
    price: 150,
    type: "Crochet",
    image: bowhairtie,
    description:
      "A sweet handmade bow for your everyday look.\nSimple, delicate, and made with love.",
  },
  {
    id: 6,
    name: "Crochet Flower Pot",
    price: 899,
    type: "Crochet",
    image:
      "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=800&q=85",
    description:
      "A charming handmade flower pot to brighten your space.\nA timeless piece of botanical crochet decor that never wilts.",
  },
  {
    id: 7,
    name: "Botanical Painting",
    price: 899,
    type: "Paintings",
    image:
      "https://images.unsplash.com/photo-1579783901586-d88db74b4fe4?auto=format&fit=crop&w=800&q=85",
    description:
      "An original botanical-inspired artwork on canvas.\nCreated with fine pigments to bring a soft touch of nature into your home.",
  },
  {
    id: 8,
    name: "Crochet Flower",
    price: 299,
    type: "Crochet",
    image:
      "https://images.unsplash.com/photo-1604881988758-f76ad2f7aac1?auto=format&fit=crop&w=800&q=85",
    description:
      "A delicate single-stem handmade crochet flower.\nA lovely, everlasting piece to keep or gift to someone special.",
  },
];

/**
 * Tiny Crochet Cat Easter Egg Animation
 * Uses the exact existing classes (.trp-cat-scene, .trp-yarn-fall, .trp-cat, etc.)
 */
function CatAnimation() {
  return (
    <div className="trp-cat-scene" aria-hidden="true">
      {/* Falling Yarn Ball */}
      <div className="trp-yarn-fall">
        <div className="trp-yarn-ball">
          <span></span>
          <span></span>
          <span></span>
        </div>
        <div className="trp-yarn-string"></div>
      </div>

      {/* Animated Crochet Cat SVG */}
      <svg
        className="trp-cat"
        viewBox="0 0 160 160"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Cat Body */}
        <ellipse cx="92" cy="120" rx="36" ry="28" fill="#d9c5b2" />
        <ellipse cx="92" cy="118" rx="28" ry="20" fill="#e8ddd8" />

        {/* Tail */}
        <path
          d="M 58 126 C 42 128 36 112 40 102 C 43 95 48 97 46 103 C 44 109 48 119 60 120 Z"
          fill="#cbb39e"
        />

        {/* Cat Head */}
        <g className="trp-cat-head">
          {/* Ears */}
          <polygon points="72,58 60,34 82,44" fill="#cbb39e" />
          <polygon points="70,54 64,38 78,46" fill="#f4cfcb" />
          <polygon points="112,58 124,34 102,44" fill="#cbb39e" />
          <polygon points="114,54 120,38 106,46" fill="#f4cfcb" />

          {/* Head Base */}
          <circle cx="92" cy="74" r="28" fill="#d9c5b2" />

          {/* Cheeks */}
          <ellipse cx="84" cy="80" rx="4" ry="2" fill="#f2b5b0" opacity="0.6" />
          <ellipse cx="100" cy="80" rx="4" ry="2" fill="#f2b5b0" opacity="0.6" />

          {/* Eyes */}
          <ellipse cx="83" cy="70" rx="3" ry="4" fill="#30251f" />
          <circle cx="82" cy="69" r="1.2" fill="#ffffff" />
          <ellipse cx="101" cy="70" rx="3" ry="4" fill="#30251f" />
          <circle cx="100" cy="69" r="1.2" fill="#ffffff" />

          {/* Nose & Mouth */}
          <polygon points="90,75 94,75 92,78" fill="#d99b98" />
          <path
            d="M 88 80 Q 92 82 92 78 Q 92 82 96 80"
            stroke="#5c4a40"
            strokeWidth="1.2"
            fill="none"
            strokeLinecap="round"
          />

          {/* Whiskers */}
          <line x1="72" y1="74" x2="56" y2="72" stroke="#8c786c" strokeWidth="1" strokeLinecap="round" />
          <line x1="72" y1="77" x2="55" y2="79" stroke="#8c786c" strokeWidth="1" strokeLinecap="round" />
          <line x1="112" y1="74" x2="128" y2="72" stroke="#8c786c" strokeWidth="1" strokeLinecap="round" />
          <line x1="112" y1="77" x2="129" y2="79" stroke="#8c786c" strokeWidth="1" strokeLinecap="round" />
        </g>

        {/* Left Paw */}
        <g className="trp-cat-paw-left">
          <ellipse cx="69" cy="108" rx="8" ry="6" fill="#f0e6de" stroke="#cbb39e" strokeWidth="1.2" />
        </g>

        {/* Right Paw */}
        <g className="trp-cat-paw-right">
          <ellipse cx="108" cy="108" rx="8" ry="6" fill="#f0e6de" stroke="#cbb39e" strokeWidth="1.2" />
        </g>

        {/* Mini Yarn in paws */}
        <g className="trp-mini-yarn">
          <circle cx="92" cy="116" r="11" fill="#a9bd9e" />
          <path d="M 85 113 Q 92 110 99 114" stroke="#5b7052" strokeWidth="1.2" fill="none" />
          <path d="M 84 117 Q 92 121 99 117" stroke="#5b7052" strokeWidth="1.2" fill="none" />
        </g>

        {/* Tiny Crochet Hook */}
        <g className="trp-hook">
          <path
            d="M 80 126 L 98 108 C 100 106 102 108 100 110"
            stroke="#d99b98"
            strokeWidth="2.4"
            strokeLinecap="round"
            fill="none"
          />
        </g>

        {/* Tiny Completed Crochet Flower Piece */}
        <g className="trp-crochet-piece">
          <circle cx="92" cy="122" r="7" fill="#efd0cd" />
          <circle cx="92" cy="122" r="3" fill="#faf5f1" />
        </g>
      </svg>
    </div>
  );
}

function App() {
  const [slide, setSlide] = useState(0);
  const [shopOpen, setShopOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [filter, setFilter] = useState("All");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showWishlist, setShowWishlist] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [showMessage, setShowMessage] = useState("");

  // Persistent wishlist with localStorage
  const [wishlist, setWishlist] = useState(() => {
    try {
      const saved = localStorage.getItem("trp_wishlist");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem("trp_wishlist", JSON.stringify(wishlist));
    } catch {
      // ignore local storage quota errors
    }
  }, [wishlist]);

  // Hero carousel auto-advance timer
  useEffect(() => {
    const timer = setInterval(() => {
      setSlide((s) => (s + 1) % slides.length);
    }, 5500);
    return () => clearInterval(timer);
  }, []);

  const current = slides[slide];

  // Filtering products
  const visibleProducts = products.filter((p) => {
    const matchesFilter = filter === "All" || p.type === filter;
    const matchesSearch =
      !searchQuery ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const nextSlide = () => setSlide((s) => (s + 1) % slides.length);
  const prevSlide = () => setSlide((s) => (s - 1 + slides.length) % slides.length);

  const showPopup = (msg) => {
    setShowMessage(msg);
    setTimeout(() => {
      setShowMessage("");
    }, 2400);
  };

  const isWishlisted = (product) => {
    if (!product) return false;
    return wishlist.some((item) => item.id === product.id);
  };

  const toggleWishlist = (product) => {
    if (!product) return;
    const exists = isWishlisted(product);
    if (exists) {
      setWishlist((currentList) => currentList.filter((item) => item.id !== product.id));
      showPopup(`${product.name} removed from wishlist`);
    } else {
      setWishlist((currentList) => [...currentList, product]);
      showPopup(`${product.name} saved to wishlist ♡`);
    }
  };

  const orderOnWhatsApp = (product) => {
    if (!product) return;
    const url = getWhatsAppOrderUrl(product);
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const scrollToSection = (id) => {
    setSelectedProduct(null);
    setMenuOpen(false);
    setShopOpen(false);
    setTimeout(() => {
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: "smooth" });
      } else {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    }, 50);
  };

  return (
    <div className="site">
      {/* Tiny Cat-and-Yarn Crochet Easter Egg */}
      <CatAnimation />

      {/* ANNOUNCEMENT BAR */}
      <aside className="announcement">
        <span>✦ Handmade with love</span>
        <span>|</span>
        <span>Made to order</span>
        <span>|</span>
        <span>Free shipping on orders above ₹999</span>
        <span>✦</span>
      </aside>

      {/* HEADER */}
      <header className="header">
        <button
          className="mobile-icon"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label={menuOpen ? "Close menu" : "Open menu"}
        >
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>

        <a
          className="logo"
          href="#home"
          onClick={(e) => {
            e.preventDefault();
            scrollToSection("home");
          }}
        >
          Theethrealpalatte
          <span className="logo-mark">❧</span>
        </a>

        <nav className={`nav ${menuOpen ? "nav-open" : ""}`}>
          <a
            href="#home"
            onClick={(e) => {
              e.preventDefault();
              scrollToSection("home");
            }}
          >
            Home
          </a>

          <div className="shop-nav">
            <button
              onClick={() => setShopOpen(!shopOpen)}
              aria-expanded={shopOpen}
              aria-haspopup="true"
            >
              Shop
              <ChevronDown size={15} className={shopOpen ? "rotated" : ""} />
            </button>

            {shopOpen && (
              <div className="shop-menu">
                <a
                  href="#products"
                  onClick={(e) => {
                    e.preventDefault();
                    setFilter("All");
                    scrollToSection("products");
                  }}
                >
                  All Pieces
                </a>
                <a
                  href="#products"
                  onClick={(e) => {
                    e.preventDefault();
                    setFilter("Crochet");
                    scrollToSection("products");
                  }}
                >
                  Crochet
                </a>
                <a
                  href="#products"
                  onClick={(e) => {
                    e.preventDefault();
                    setFilter("Paintings");
                    scrollToSection("products");
                  }}
                >
                  Paintings
                </a>
              </div>
            )}
          </div>

          <a
            href="#about"
            onClick={(e) => {
              e.preventDefault();
              scrollToSection("about");
            }}
          >
            About
          </a>

          <a
            href="#contact"
            onClick={(e) => {
              e.preventDefault();
              scrollToSection("contact");
            }}
          >
            Contact
          </a>
        </nav>

        <div className="header-actions">
          <button
            aria-label="Search collection"
            onClick={() => setShowSearch(!showSearch)}
            style={{ background: "transparent", border: 0, cursor: "pointer", padding: "6px" }}
          >
            <Search size={20} />
          </button>

          <button
            className="wishlist-btn"
            aria-label="View Wishlist"
            onClick={() => setShowWishlist(true)}
          >
            <Heart size={20} fill={wishlist.length > 0 ? "var(--blush-strong)" : "none"} />
            {wishlist.length > 0 && <span className="badge">{wishlist.length}</span>}
          </button>
        </div>
      </header>

      {/* SEARCH BAR (ACCORDION) */}
      {showSearch && (
        <div className="search-box-wrap">
          <input
            type="text"
            placeholder="Search crochet, bouquets, keychains, paintings..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            autoFocus
          />
        </div>
      )}

      {/* MAIN VIEW */}
      {selectedProduct ? (
        /* ==================================================
           PRODUCT DETAIL PAGE
        ================================================== */
        <main>
          <section className="product-detail">
            <button
              className="product-detail-back"
              onClick={() => setSelectedProduct(null)}
              aria-label="Back to Collection"
            >
              ← Back to Collection
            </button>

            <div className="product-detail-content">
              {/* IMAGE */}
              <div className="product-detail-image">
                <button
                  className={`detail-image-wishlist ${isWishlisted(selectedProduct) ? "active" : ""}`}
                  aria-label={
                    isWishlisted(selectedProduct)
                      ? "Remove from wishlist"
                      : "Add to wishlist"
                  }
                  onClick={() => toggleWishlist(selectedProduct)}
                >
                  <Heart
                    size={20}
                    fill={isWishlisted(selectedProduct) ? "#c94a4a" : "none"}
                    color={isWishlisted(selectedProduct) ? "#c94a4a" : "currentColor"}
                  />
                </button>

                <img src={selectedProduct.image} alt={selectedProduct.name} />
              </div>

              {/* PRODUCT INFORMATION */}
              <div className="product-detail-info">
                <p className="eyebrow">{selectedProduct.type}</p>
                <h1>{selectedProduct.name}</h1>
                <p className="product-detail-price">
                  ₹{selectedProduct.price.toLocaleString("en-IN")}
                </p>

                <div className="product-custom-note">
                  ✨ Handcrafted slowly to order. Color customization available on request.
                </div>

                <p className="product-detail-description">
                  {selectedProduct.description}
                </p>

                {/* ACTIONS */}
                <div className="product-actions">
                  <button
                    className="detail-whatsapp"
                    onClick={() => orderOnWhatsApp(selectedProduct)}
                  >
                    <span>💬 Order on WhatsApp</span>
                  </button>

                  <button
                    className="detail-wishlist-toggle"
                    onClick={() => toggleWishlist(selectedProduct)}
                  >
                    <Heart
                      size={18}
                      fill={isWishlisted(selectedProduct) ? "var(--blush-strong)" : "none"}
                      color={isWishlisted(selectedProduct) ? "var(--blush-strong)" : "currentColor"}
                    />
                    {isWishlisted(selectedProduct)
                      ? "Saved in Wishlist"
                      : "Add to Wishlist"}
                  </button>
                </div>
              </div>
            </div>
          </section>
        </main>
      ) : (
        /* ==================================================
           HOMEPAGE VIEW
        ================================================== */
        <main id="home">
          {/* HERO CAROUSEL */}
          <section className="hero">
            <button
              className="hero-arrow left"
              onClick={prevSlide}
              aria-label="Previous slide"
            >
              <ChevronLeft size={20} />
            </button>

            <div className="hero-copy">
              <div className="eyebrow">
                <span>✦</span>
                <span>{current.eyebrow}</span>
              </div>
              <h1>{current.title}</h1>
              <div className="title-line"></div>
              <p>{current.text}</p>
              <button
                className="primary-btn"
                onClick={() => {
                  setFilter(current.filter);
                  scrollToSection("products");
                }}
              >
                Explore Collection
                <ArrowRight size={16} />
              </button>
            </div>

            <div className="hero-image-wrap">
              <img
                src={current.image}
                alt={current.alt}
                className="hero-image"
              />
              <div className="hero-soft-overlay"></div>
            </div>

            <button
              className="hero-arrow right"
              onClick={nextSlide}
              aria-label="Next slide"
            >
              <ChevronRight size={20} />
            </button>

            <div className="dots">
              {slides.map((_, i) => (
                <button
                  key={i}
                  className={i === slide ? "dot active" : "dot"}
                  onClick={() => setSlide(i)}
                  aria-label={`Go to slide ${i + 1}`}
                />
              ))}
            </div>
          </section>

          {/* DESKTOP FEATURED COLLECTIONS */}
          <section className="desktop-only" style={{ padding: "50px 5.5% 20px" }}>
            <div className="collection-grid">
              <button
                onClick={() => {
                  setFilter("Crochet");
                  scrollToSection("products");
                }}
              >
                <img src={crochetHero} alt="Handmade Crochet" />
                <div>
                  <strong>Handmade Crochet</strong>
                  <small>Bouquets, clips, keychains & decor</small>
                </div>
              </button>
              <button
                onClick={() => {
                  setFilter("Paintings");
                  scrollToSection("products");
                }}
              >
                <img src={paintingHero} alt="Original Paintings" />
                <div>
                  <strong>Original Paintings</strong>
                  <small>Botanical & abstract canvas art</small>
                </div>
              </button>
            </div>
          </section>

          {/* PRODUCTS CATALOG SECTION */}
          <section className="products-section" id="products">
            <div className="section-heading">
              <span>✦</span>
              <h2>Curated Collection</h2>
              <span>✦</span>
              <p>Handmade with patience, packed with care.</p>
            </div>

            {/* CATEGORY FILTERS */}
            <div className="filters">
              {["All", "Crochet", "Paintings"].map((category) => (
                <button
                  key={category}
                  className={filter === category ? "selected" : ""}
                  onClick={() => setFilter(category)}
                >
                  {category}
                </button>
              ))}
            </div>

            {/* PRODUCT GRID */}
            <div className="product-grid">
              {visibleProducts.length === 0 ? (
                <div style={{ gridColumn: "1 / -1", textAlign: "center", padding: "40px", color: "var(--muted)" }}>
                  <p>No pieces found matching your filter.</p>
                  <button
                    className="primary-btn"
                    style={{ marginTop: "14px" }}
                    onClick={() => {
                      setFilter("All");
                      setSearchQuery("");
                    }}
                  >
                    View All Pieces
                  </button>
                </div>
              ) : (
                visibleProducts.map((product) => (
                  <article className="product-card" key={product.id}>
                    <div
                      className="product-image"
                      onClick={() => setSelectedProduct(product)}
                      style={{ cursor: "pointer" }}
                    >
                      <img src={product.image} alt={product.name} loading="lazy" />

                      <button
                        className="wishlist"
                        aria-label={
                          isWishlisted(product)
                            ? `Remove ${product.name} from wishlist`
                            : `Save ${product.name} to wishlist`
                        }
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleWishlist(product);
                        }}
                      >
                        <Heart
                          size={17}
                          fill={isWishlisted(product) ? "#c94a4a" : "none"}
                          color={isWishlisted(product) ? "#c94a4a" : "var(--espresso)"}
                        />
                      </button>
                    </div>

                    <div className="product-info">
                      <div
                        onClick={() => setSelectedProduct(product)}
                        style={{ cursor: "pointer", flex: 1 }}
                      >
                        <h3>{product.name}</h3>
                        <p>₹{product.price.toLocaleString("en-IN")}</p>
                      </div>

                      <button
                        className="card-whatsapp-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          orderOnWhatsApp(product);
                        }}
                        aria-label={`Order ${product.name} on WhatsApp`}
                        title="Order directly on WhatsApp"
                      >
                        <span>💬 Order</span>
                      </button>
                    </div>
                  </article>
                ))
              )}
            </div>
          </section>

          {/* ABOUT SECTION (PRESERVED CONTENT & STYLES) */}
          <section className="about" id="about">
            <div className="about-inner">
              <p className="eyebrow">ABOUT THEETHREALPALATTE</p>
              <h2>
                Made slowly.<br />
                Made with feeling.
              </h2>
              <p className="about-text">
                Theethrealpalatte is a little space for handmade things, thoughtful details, and art made from the heart.
              </p>
              <p className="about-text">
                From delicate crochet pieces to original paintings, every creation is made by hand, one piece at a time.
                No two pieces are exactly alike — and that's what makes them special.
              </p>
              <p className="about-signature">— Theethrealpalatte</p>
            </div>
          </section>
        </main>
      )}

      {/* CONTACT SECTION & FOOTER (PRESERVED CONTENT & STYLES) */}
      <footer className="contact-section" id="contact">
        <div className="contact-inner">
          <div className="contact-heading">
            <p className="eyebrow">GET IN TOUCH</p>
            <h2>
              Let's create something<br />beautiful.
            </h2>
            <p>
              Have a question, want a custom piece, or simply want to say hello?
              We'd love to hear from you.
            </p>
          </div>

          <div className="contact-links">
            <a href={`mailto:${BUSINESS_CONFIG.email}`}>
              <span>Email</span>
              <strong>{BUSINESS_CONFIG.email}</strong>
            </a>

            <a
              href={BUSINESS_CONFIG.instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              <span>Instagram</span>
              <strong>{BUSINESS_CONFIG.instagramHandle}</strong>
            </a>

            <a
              href={`https://wa.me/${BUSINESS_CONFIG.whatsappNumber}?text=${encodeURIComponent("Hello Theethrealpalatte! 🌸 I would like to enquire about your creations.")}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <span>WhatsApp</span>
              <strong>Message us</strong>
            </a>
          </div>
        </div>

        <div className="contact-bottom">
          <p>© 2026 Theethrealpalatte</p>
          <p>Handmade with love.</p>
        </div>
      </footer>

      {/* WISHLIST SLIDE-OUT DRAWER */}
      {showWishlist && (
        <div
          className="overlay"
          onClick={() => setShowWishlist(false)}
          role="dialog"
          aria-modal="true"
          aria-label="Wishlist drawer"
        >
          <div className="cart-panel" onClick={(e) => e.stopPropagation()}>
            <button
              className="close-panel"
              onClick={() => setShowWishlist(false)}
              aria-label="Close wishlist"
            >
              <X size={20} />
            </button>

            <h2>Saved Pieces ({wishlist.length})</h2>

            {wishlist.length === 0 ? (
              <div className="empty-state">
                <p>Your wishlist is currently empty.</p>
                <p style={{ marginTop: "8px", fontSize: "13px" }}>
                  Tap the heart icon on any piece to save it for later ♡
                </p>
              </div>
            ) : (
              <div>
                {wishlist.map((item) => (
                  <div className="cart-item" key={item.id}>
                    <img
                      src={item.image}
                      alt={item.name}
                      onClick={() => {
                        setSelectedProduct(item);
                        setShowWishlist(false);
                      }}
                    />

                    <div className="cart-item-info">
                      <h3
                        onClick={() => {
                          setSelectedProduct(item);
                          setShowWishlist(false);
                        }}
                      >
                        {item.name}
                      </h3>
                      <p>₹{item.price.toLocaleString("en-IN")}</p>

                      <div className="cart-item-actions">
                        <button
                          className="item-whatsapp-btn"
                          onClick={() => orderOnWhatsApp(item)}
                        >
                          💬 Order on WhatsApp
                        </button>

                        <button
                          className="item-remove-btn"
                          onClick={() => toggleWishlist(item)}
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* FLOATING TOAST NOTIFICATION */}
      {showMessage && (
        <div className="toast-popup" role="status" aria-live="polite">
          <span>{showMessage}</span>
        </div>
      )}
    </div>
  );
}

createRoot(document.getElementById("root")).render(<App />);