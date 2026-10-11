# Roadmap

## Phase 1: Foundation & Build Fixes
- **Status**: Ready to plan
- **Goal**: Resolve file path anomalies (move `main.jsx` into `src/` to align with `index.html`), ensure root / subdirectory configuration is clean, verify dev and production build scripts run without errors.
- **Deliverables**:
  - Validated build pipeline (`npm run build` succeeds).
  - Clean dev startup (`npm run dev`).

## Phase 2: Component Architecture & Refactoring
- **Status**: Pending Phase 1
- **Goal**: Break down monolithic `main.jsx` (~2,877 lines) into clean, modular, reusable React components and dedicated data files.
- **Deliverables**:
  - `src/data/products.js` & `src/data/slides.js`
  - `src/components/Header.jsx` & `AnnouncementBar.jsx`
  - `src/components/HeroCarousel.jsx`
  - `src/components/ProductCard.jsx` & `ProductGrid.jsx`
  - `src/components/ProductModal.jsx`
  - `src/components/CartDrawer.jsx` & `WishlistDrawer.jsx`
  - `src/components/Toast.jsx`

## Phase 3: State Persistence & Routing
- **Status**: Pending Phase 2
- **Goal**: Persist cart and wishlist state in `localStorage` so items survive page reloads; wire up `react-router-dom` for deep-linkable URLs (`/`, `/shop`, `/product/:id`, `/wishlist`, `/cart`).
- **Deliverables**:
  - Custom hooks: `useCart`, `useWishlist` with localStorage sync.
  - Page routes and navigation using `react-router-dom`.

## Phase 4: WhatsApp Checkout & Order Summary
- **Status**: Pending Phase 3
- **Goal**: Implement a checkout modal and pre-filled WhatsApp order generation allowing buyers to submit their order details straight to the seller.
- **Deliverables**:
  - Checkout form (name, contact number, delivery address, custom notes).
  - WhatsApp link generation utility (`https://wa.me/...`).
  - Order confirmation screen.

## Phase 5: Testing & Polishing
- **Status**: Pending Phase 4
- **Goal**: Establish automated testing with Vitest and perform responsive design and accessibility audit.
- **Deliverables**:
  - Vitest test setup and unit test suite for cart and pricing logic.
  - Accessibility audit and performance optimization.
