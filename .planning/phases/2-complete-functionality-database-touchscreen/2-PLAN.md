# Phase 2 Plan — Complete Website Functionality, Supabase Database & Touchscreen Optimization

## Plan Summary
- **Task 1: Fix Admin Dashboard Thumbnail Duplication & Image Management**:
  - Import verified catalog image assets into `AdminDashboard.jsx`.
  - Implement `resolveProductImage(prod)` helper that maps each product to its dedicated boutique thumbnail if not a remote storage URL.
  - Implement image file validation (MIME type check and file size <= 5MB).
  - Implement image replacement with cleanup of orphaned storage objects where safe.
- **Task 2: Automate Stock & Dynamic Database Statistics**:
  - In `handleSaveProduct`: If `stock <= 0`, automatically set `isAvailable = false`.
  - Dynamic calculations for Total, In-Stock, Out-of-Stock, and Category breakdown in dashboard.
- **Task 3: Make Admin Dashboard Fully Responsive & Touch-Friendly**:
  - Replace wide overflowing table on mobile/tablet screens with responsive product cards.
  - Ensure all admin buttons (Edit, Delete, Stock Toggle, Add Product) have >= 44px tap targets.
- **Task 4: Optimize Customer Storefront for Touchscreens (320px to 1920px)**:
  - Enforce `min-height: 44px` and `min-width: 44px` across all interactive elements (`.add-cart`, `.cart-btn`, `.close-panel`, `.quantity-controls button`, `.item-remove-btn`, `.item-add-cart-btn`, `.item-whatsapp-btn`, `.checkout-whatsapp-btn`, filter pills).
  - Add active touch states (`:active { transform: scale(0.97); }`) and accessible focus outlines.
  - Ensure `html, body { overflow-x: hidden; }` prevents horizontal jitter on mobile.
- **Task 5: End-to-End Verification & Browser Tests**:
  - Run `npm run build` to confirm clean compilation.
  - Run comprehensive Playwright test across 320px, 375px, 390px, 430px, 768px, 1024px, 1366px, 1920px.
  - Write `2-UAT.md` tracking all 19 test items.
- **Task 6: Commit and Push Work (`/gsd-ship`)**:
  - Stage, commit, and push changes to `main`.
