# Theethrealpalatte 🌸

Responsive storefront for handmade crochet pieces and original paintings with direct WhatsApp prepaid ordering.

## Features (V1)

- **Artisanal Storefront**: Warm cream and blush palette with Cormorant Garamond & DM Sans typography.
- **Hero Carousel**: Interactive banner showcasing Crochet and Original Art collections with auto-sliding and arrow/dot controls.
- **Product Catalog**:
  - Filter by category (`All`, `Crochet`, `Paintings`).
  - Instant product search.
  - Product detail modal with descriptions and customization notes.
- **Direct WhatsApp Ordering**:
  - Instant "💬 Order on WhatsApp" buttons on each product card and detail modal.
  - Automatically compiles product title, category, and INR price into a pre-filled WhatsApp message sent to the store owner.
- **Persistent Wishlist**:
  - Heart toggle saves items to `localStorage` (survives page reloads).
  - Header badge counter and slide-out Wishlist drawer.
- **Artisanal About & Contact Sections**:
  - Preserved brand story and direct links to Email, Instagram, and WhatsApp.
- **Tiny Easter Egg**:
  - Subtle corner cat-and-yarn crochet animation in the bottom-left corner.

## Getting Started

### 1. Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher recommended).

### 2. Installation
```bash
# Navigate to the app directory
cd theethrealpalatte

# Install dependencies
npm install
```

### 3. Development Server
```bash
npm run dev
```
Open `http://localhost:5173/` in your browser.

### 4. Production Build
```bash
npm run build
```
Build output is generated cleanly into `dist/`.

## Configuration

To customize your business WhatsApp number, email, or Instagram handle, edit `src/config.js`:

```javascript
export const BUSINESS_CONFIG = {
  whatsappNumber: "918088645598", // Your phone number with country code
  email: "theethrealpalatte@gmail.com",
  instagramHandle: "@_theethrealpalatte_",
  instagramUrl: "https://www.instagram.com/_theethrealpalatte_/",
};
```
