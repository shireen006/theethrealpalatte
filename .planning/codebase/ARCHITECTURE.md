# Architecture

## Overview
The application is a client-side Single Page Application (SPA) designed as an artisanal e-commerce storefront for handmade crochet goods and original paintings ("Theethrealpalatte").

## Current Component Architecture
Currently, the entire application lifecycle and UI is housed inside a monolithic file (`main.jsx`):
- **Entry & Mount**: `createRoot(document.getElementById("root")).render(<App />);`
- **Component Tree**:
  - `App`: Monolithic container component maintaining global application state.
    - Top Announcement Bar
    - Header & Navigation (Logo, Search, Desktop/Mobile Menus, Category Dropdowns, Wishlist trigger, Cart trigger)
    - Hero Carousel (Interactive slide deck with auto-advance timer and manual chevron controls)
    - Collections Showcase (Desktop view showcasing Crochet & Painting categories)
    - Product Grid (Filter bar: "All" | "Crochet" | "Paintings", grid of responsive Product Cards)
    - Product Detail Modal (`selectedProduct`)
    - Slide-out Cart Drawer (`showCart`)
    - Slide-out Wishlist Drawer (`showWishlist`)
    - Toast / Feedback Alert (`showMessage`)

## State Management
- **In-Memory Local State**:
  - Managed exclusively through React `useState` and `useEffect` hooks in `App`.
  - `cart`: Array of `{ id, name, price, type, image, quantity }` objects with add/remove/increment/decrement helpers.
  - `wishlist`: Array of wishlisted product items with toggle helpers.
  - `selectedProduct`: Active product item for the detail modal view.
  - `filter`: Active product category filter (`"All"`, `"Crochet"`, `"Paintings"`).
  - `slide`: Active hero index (cycled every 5.5s via `setInterval`).
  - `showCart`, `showWishlist`, `menuOpen`, `shopOpen`: Overlay UI visibility toggles.
  - `showMessage`: Temporary toast notification text auto-clearing after 2,000ms.

## Data Layer
- Hardcoded static in-memory data structures:
  - `slides`: Array of hero banner objects (eyebrow, title, text, image, alt).
  - `products`: Array of 8 catalog items with attributes (id, name, price, type, image, description).
