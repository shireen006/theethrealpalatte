# Phase 1 Context: Repair and Complete Existing Website

## Objective
Repair the existing React + Vite website for **Theethrealpalatte** (handmade crochet and original art) to make it fully functional and error-free without rebuilding or changing the existing design.

## User Decisions & Constraints
- **Preserve Design**: Keep existing homepage, branding, fonts (`Cormorant Garamond`, `DM Sans`), colours (`--cream`, `--espresso`, `--blush`, etc.), spacing, images, and CSS.
- **Store Flow V1**:
  - Manual prepaid ordering through WhatsApp.
  - Direct WhatsApp order button on product cards and in product detail modal.
  - WhatsApp message includes product name, price in INR, and order details.
  - Remove cart, checkout, customer accounts, and cash-on-delivery.
  - Contact links:
    - WhatsApp Business: Configurable constant in `src/config.js` (defaulting to configured number/placeholder with immediate update guide).
    - Instagram: `@theethrealpalatte` (`https://instagram.com/theethrealpalatte`).
    - Email: `contact@theethrealpalatte.com` (`mailto:contact@theethrealpalatte.com`).
- **Core Features**:
  - Functional hero carousel (arrows, indicator dots, auto-slide).
  - Product catalog browsing with category filter ("All", "Crochet", "Paintings").
  - Product detail modal with image, pricing, description, customization note, and WhatsApp order button.
  - Wishlist toggle and drawer panel.
  - About section and Footer matching existing CSS styles.
  - Corner cat-and-yarn animation using existing `.trp-cat` and `.trp-yarn-*` styles in `styles.css`.
- **Safety & Quality**:
  - Back up original files before editing.
  - Fix source files in place; ensure `npm run build` succeeds with zero errors.
  - Test every interactive feature in the browser.
