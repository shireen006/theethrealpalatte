# Phase 1 Plan: Repair and Complete Website

## Goal
Resolve all syntax, import, build, and component errors in Theethrealpalatte, implement the V1 WhatsApp ordering flow, enable the Wishlist, restore About/Footer, enable hero carousel controls, and activate the corner cat-and-yarn animation.

## Wave 1: Backup & Structure Setup
- **Task 1.1**: Create backup copy of original `theethrealpalatte/main.jsx` and files in `theethrealpalatte/backup/`.
- **Task 1.2**: Place `src/main.jsx` and create `src/config.js` with business contact constants (`WHATSAPP_NUMBER`, `INSTAGRAM_HANDLE`, `CONTACT_EMAIL`).

## Wave 2: Source Code Repair & Store Flow V1
- **Task 2.1**: Fix JSX syntax errors, malformed templates, escaping backslashes, and image import references in `main.jsx`.
- **Task 2.2**: Remove cart, checkout, customer account, and COD logic.
- **Task 2.3**: Implement direct WhatsApp order buttons (`https://wa.me/...`) with prefilled order template for each product on cards and in product detail modal.
- **Task 2.4**: Wire up the Wishlist (toggle state, counter badge in navigation, slide-out drawer).
- **Task 2.5**: Wire up Hero Carousel arrows and indicator dots with auto-sliding timer.
- **Task 2.6**: Connect category filtering ("All", "Crochet", "Paintings") and navigation links.
- **Task 2.7**: Render the About section and Footer matching `styles.css` (.about, footer, .footer-links).
- **Task 2.8**: Activate the unobtrusive corner cat-and-yarn crochet animation leveraging existing CSS rules.

## Wave 3: Build Verification & Testing
- **Task 3.1**: Run `npm run build` and ensure production build completes with 0 errors.
- **Task 3.2**: Start Vite dev server and test responsive UI, navigation, carousel, wishlist, WhatsApp buttons, and modal dialogs.
