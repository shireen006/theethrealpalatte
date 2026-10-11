# Tech Stack

## Core Technologies
- **Runtime & Language**: Node.js, JavaScript (ES Modules, `"type": "module"`)
- **Frontend Framework**: React 18 (`react` ^18.3.1, `react-dom` ^18.3.1)
- **Routing**: `react-router-dom` ^7.1.1 (installed in `package.json`; currently single-page state driven in `main.jsx`)
- **Build Tooling & Bundler**: Vite 6 (`vite` ^6.0.5, `@vitejs/plugin-react` ^4.3.4)
- **Icon Library**: `lucide-react` ^0.468.0

## Styling & Typography
- **CSS Architecture**: Vanilla CSS (`src/styles.css`) using CSS Custom Properties (`--cream`, `--soft-cream`, `--blush`, `--blush-strong`, `--blush-pale`, `--espresso`, `--muted`, `--line`, `--white`)
- **Typography**: Google Fonts
  - Cormorant Garamond (Serif, weights 400-700) for luxury headings and branding
  - DM Sans (Sans-serif, weights 400-600) for UI, body, and navigation
- **Layout Model**: Flexbox and CSS Grid with responsive media queries for desktop and mobile breakpoints

## Asset Management
- **Local Static Media**: Local raster images in `src/images/` (`.jpg`, `.jpeg`) imported via ES module syntax in `main.jsx`
- **External Media**: Remote photography sourced via Unsplash CDN
