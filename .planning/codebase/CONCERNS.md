# Technical Debt & Architecture Concerns

## 1. Script Path Discrepancy in `index.html` (Critical)
- In `theethrealpalatte/index.html` (line 14):
  ```html
  <script type="module" src="/src/main.jsx"></script>
  ```
  However, `main.jsx` is located directly in `theethrealpalatte/main.jsx` (not inside `src/`).
  When Vite launches from `theethrealpalatte/`, this will fail to locate `/src/main.jsx` unless `main.jsx` is moved into `src/` or the script tag is updated to `/main.jsx`. Moving `main.jsx` into `src/main.jsx` is standard Vite convention.

## 2. Monolithic Single-File Component (`main.jsx`)
- `main.jsx` is 2,877 lines long, bundling all data structures, states, modals, drawers, header navigation, hero carousel, product catalog, and checkout triggers into a single file.
- **Risk**: Hard to maintain, difficult to test, high chance of merge conflicts and accidental regression.
- **Recommendation**: Deconstruct into modular components in `src/components/`:
  - `Header.jsx`, `AnnouncementBar.jsx`, `HeroCarousel.jsx`, `CategoryFilter.jsx`, `ProductGrid.jsx`, `ProductCard.jsx`, `ProductModal.jsx`, `CartDrawer.jsx`, `WishlistDrawer.jsx`.
  - Extract `products` and `slides` into `src/data/products.js` and `src/data/slides.js`.

## 3. Ephemeral In-Memory State (Data Loss)
- `cart` and `wishlist` states live purely in component memory. Any browser refresh wipes out all selected items.
- **Recommendation**: Implement `localStorage` synchronization for both `cart` and `wishlist` hooks.

## 4. Missing Routing Integration
- `react-router-dom` is installed in `package.json` (`^7.1.1`), but not utilized. The application currently relies on modal overlays (`selectedProduct`) instead of deep-linkable URLs (e.g. `/product/:id`, `/shop/crochet`, `/cart`).

## 5. Directory Nesting (`theethrealpalatte-starter/theethrealpalatte/`)
- The repository has an outer folder `theethrealpalatte-starter` containing an empty root lockfile and a nested folder `theethrealpalatte`. Commands must be executed with CWD set to `./theethrealpalatte` or consolidated to root.
