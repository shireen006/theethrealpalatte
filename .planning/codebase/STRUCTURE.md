# Project Directory Structure

## Repository Layout

```text
theethrealpalatte-starter/
├── package-lock.json             # Root lockfile (placeholder)
├── .planning/                    # GSD Planning & Architecture Documentation
│   ├── codebase/                 # Evidence-backed codebase map
│   │   ├── STACK.md
│   │   ├── INTEGRATIONS.md
│   │   ├── ARCHITECTURE.md
│   │   ├── STRUCTURE.md
│   │   ├── CONVENTIONS.md
│   │   ├── TESTING.md
│   │   └── CONCERNS.md
│   ├── onboarding/
│   │   └── SUMMARY.md            # Onboarding map and next steps
│   ├── PROJECT.md                # Project mission and goals
│   ├── REQUIREMENTS.md           # Scoped project requirements
│   ├── ROADMAP.md                # Multi-phase execution roadmap
│   ├── STATE.md                  # Project memory & current progress
│   └── config.json               # GSD workflow configuration
│
└── theethrealpalatte/            # Main Vite + React application root
    ├── index.html                # Entry HTML document (links Google Fonts and script)
    ├── main.jsx                  # Primary React application script and component tree
    ├── package.json              # App scripts (dev, build, preview) & dependencies
    ├── package-lock.json         # NPM dependency lockfile
    ├── README.md                 # Project background and roadmap notes
    ├── node_modules/             # Installed node packages
    └── src/
        ├── styles.css            # Complete design system tokens and styling rules
        └── images/               # Local product and hero photography assets
            ├── bowhairtie.jpeg
            ├── butterflyhairtie.jpg
            ├── crochet-hero.jpg
            ├── fourleafcloverkeychain.jpg
            ├── keychain.jpg
            ├── painting-hero.jpeg
            └── sunflowerbouquet.jpg
```

## Key File Responsibilities
- `theethrealpalatte/main.jsx`: Encapsulates all presentation logic, modal rendering, user handlers, and data arrays.
- `theethrealpalatte/src/styles.css`: Houses CSS custom property theme tokens, responsive breakpoints, layout containers, animations, and modal overlays.
- `theethrealpalatte/index.html`: Mount target (`#root`) and font imports.
