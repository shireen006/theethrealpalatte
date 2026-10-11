# Code Conventions & Style Guide

## JavaScript / React Conventions
- **Component Paradigms**: Modern functional components with React Hooks (`useState`, `useEffect`).
- **File Extensions**: `.jsx` for components containing JSX syntax.
- **Naming Conventions**:
  - Components: PascalCase (`App`).
  - State variables & setters: camelCase (`wishlist`, `setWishlist`, `cart`, `setCart`).
  - Event Handlers: camelCase with action prefix (`toggleWishlist`, `addToCart`, `showPopup`).
  - Constant Data Collections: lowercase plural nouns (`slides`, `products`).
- **Formatting**:
  - Double and single quotes mixed across files.
  - Spaced vertical formatting in `main.jsx` (double/triple newlines between lines). Normalizing to standard 2-space indentation and clean spacing is recommended.

## CSS & Styling Conventions
- **Naming Pattern**: kebab-case class names (`.announcement`, `.shop-nav`, `.cart-panel`, `.close-panel`, `.cart-item`).
- **Color Variables**: Centralized design tokens in `:root` inside `src/styles.css`:
  - `--cream`: Primary page background (`#fffdfb`)
  - `--soft-cream`: Secondary container background (`#faf5f1`)
  - `--blush` / `--blush-strong` / `--blush-pale`: Brand accent palette (`#efd0cd`, `#d99b98`, `#f7e5e3`)
  - `--espresso`: High-contrast dark typography (`#30251f`)
  - `--muted`: Secondary / muted body text (`#786a64`)
  - `--line`: Subtle border and separator color (`#e8ddd8`)
- **Responsive Breakpoints**: Media queries tailored around mobile viewports (`max-width: 768px` / `900px`).
