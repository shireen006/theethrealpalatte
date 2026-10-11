# Testing Strategy & Current Status

## Current Status
- **Test Framework**: None installed currently.
- **Test Files**: 0 test suites, 0 unit tests.
- **Scripts in package.json**: Only `"dev"`, `"build"`, `"preview"`.
- **Validation**: Visual and manual testing via Vite development server (`npm run dev`).

## Recommended Testing Architecture
1. **Unit & Component Testing**:
   - Install `vitest`, `@testing-library/react`, and `@testing-library/jest-dom`.
   - Add unit tests for critical business logic:
     - Cart price calculations, quantity increments/decrements, item removal.
     - Wishlist toggle logic and duplicate prevention.
     - Category filter logic.
2. **End-to-End (E2E) Testing**:
   - Add Playwright or Cypress for core shopping flows:
     - Adding items to cart.
     - Opening wishlist and cart drawers.
     - Opening and closing the product detail modal.
     - WhatsApp message compilation and redirect.
