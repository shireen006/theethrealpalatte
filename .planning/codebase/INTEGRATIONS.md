# Integrations & External Services

## External Services & CDNs
- **Google Fonts CDN**:
  - `https://fonts.googleapis.com` & `https://fonts.gstatic.com`
  - Loads `Cormorant Garamond` and `DM Sans` fonts via `<link>` tags in `index.html`.
- **Unsplash Image CDN**:
  - `https://images.unsplash.com`
  - Used for fallback and placeholder product images (e.g. flower pots, botanical paintings).
- **Lucide Icons**:
  - Bundled as an npm package (`lucide-react`) for SVG icons (Search, Heart, ShoppingBag, UserRound, Menu, X, ChevronDown, ChevronLeft, ChevronRight, ArrowRight).

## Planned Integrations
- **WhatsApp Checkout**:
  - Stated in `README.md` as the target checkout flow.
  - Generates pre-filled WhatsApp order messages sent directly to the store owner's phone number with cart items, item counts, total price, and customer shipping details.
- **Persistent Storage**:
  - Future local storage or lightweight backend/database integration if persistent customer or order histories are required.
