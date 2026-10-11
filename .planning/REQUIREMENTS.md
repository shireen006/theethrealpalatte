# Requirements

## Functional Requirements

### 1. Storefront & Catalog Browsing
- **REQ-01**: Customers must be able to view featured categories (Crochet, Original Art/Paintings) in a responsive hero carousel.
- **REQ-02**: Customers must be able to filter products by category (`All`, `Crochet`, `Paintings`).
- **REQ-03**: Customers must be able to view detailed product information (images, price in INR, title, description, customization options) via product modal or dedicated page.

### 2. Wishlist & Cart Management
- **REQ-04**: Customers must be able to add/remove items to/from an interactive Wishlist.
- **REQ-05**: Customers must be able to add products to a shopping Cart with quantity adjustment (+, -) and item removal.
- **REQ-06**: Cart and Wishlist state must persist across page refreshes via browser `localStorage`.
- **REQ-07**: Real-time cart subtotal and count must update across header badges and drawer panels.

### 3. Ordering & Checkout
- **REQ-08**: Customers must be able to trigger an order summary review.
- **REQ-09**: System must format cart contents into a WhatsApp message link (with product names, quantities, individual prices, total amount, and customer shipping/notes) directed to the shop owner's WhatsApp number.

### 4. Usability & Aesthetics
- **REQ-10**: The application must be fully responsive across mobile, tablet, and desktop viewports.
- **REQ-11**: Visual styling must adhere to the artisanal luxury palette (warm cream backgrounds, blush accents, espresso text, Cormorant Garamond & DM Sans typography).
- **REQ-12**: Clear feedback notifications (toasts) must appear on actions (e.g., "Added to cart", "Item removed").

## Non-Functional Requirements
- **NFR-01 (Performance)**: Page load time under 1.5 seconds, optimized image delivery, lazy-loaded components.
- **NFR-02 (Maintainability)**: Decompose monolithic `main.jsx` into focused, reusable component files and data modules.
- **NFR-03 (Build Integrity)**: Zero build or bundler errors during `vite build`.
- **NFR-04 (Accessibility)**: Accessible color contrast, keyboard-navigable dialogs and buttons, and semantic markup.
