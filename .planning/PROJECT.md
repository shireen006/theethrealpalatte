# Project: Theethrealpalatte

## Overview
**Theethrealpalatte** is a boutique responsive storefront web application dedicated to artisanal goods: handmade crochet accessories and original hand-painted artworks. The goal is to provide a serene, warm, and luxurious shopping experience reflecting the care and slow-craft nature of the items.

## Vision & Objective
- Provide an immersive, aesthetic e-commerce catalog tailored to handmade creations.
- Enable direct-to-consumer order flow with minimal friction, supporting WhatsApp-based checkout and transparent order summaries.
- Maintain a fast, lightweight, and responsive frontend built with React and modern CSS.

## Current Baseline
- Responsive single-page application built with React 18, Vite 6, and Lucide Icons.
- Design palette using soft cream, blush accents, and espresso typography.
- Hero carousel with auto-sliding banner showcases.
- Dynamic product catalog with category filtering (`All`, `Crochet`, `Paintings`).
- Interactive product modals, wishlist state, and cart drawer with price calculations.

## Next Milestones & Focus Areas
1. **Directory & Build Sanitization**: Align `index.html` entry point (`/src/main.jsx`), normalize directory structure, and ensure `npm run dev` / `npm run build` run without warnings.
2. **Component Modularization**: Break `main.jsx` (~2,877 lines) into clean, maintainable modular components (`Header`, `Hero`, `ProductCard`, `ProductModal`, `CartDrawer`, `WishlistDrawer`, etc.).
3. **State Persistence & Routing**: Add `localStorage` persistence for cart/wishlist items and introduce `react-router-dom` for dedicated routes (`/`, `/shop`, `/product/:id`, `/wishlist`, `/cart`).
4. **WhatsApp Checkout Flow**: Generate complete formatted order messages with customer details, item breakdowns, and WhatsApp direct redirect links.
5. **Testing & Quality Assurance**: Set up Vitest and component tests for core purchasing flows.
