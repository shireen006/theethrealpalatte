# Roadmap

## Phase 1: Foundation, Build & WhatsApp Hardening
- **Status**: COMPLETE & VERIFIED (UAT Report: `1-UAT.md`)
- **Deliverables**:
  - Validated build pipeline (`npm run build` succeeds).
  - WhatsApp-first workflow (+91 8088645598) with zero checkout/payment forms.
  - Server-side RBAC and privilege escalation protection trigger.

## Phase 2: Complete Functionality, Supabase Database & Touchscreen Optimization
- **Status**: ACTIVE / IN PROGRESS
- **Goal**:
  - Fix admin thumbnail duplication by linking individual product images.
  - Complete product CRUD with Supabase PostgreSQL and Storage image management (upload, replace, validate).
  - Implement stock management with automatic availability toggling when stock reaches 0.
  - Dynamic database-driven dashboard statistics.
  - Touchscreen optimization across entire website: 44px touch targets, tap menus, mobile cart/modals, active touch feedback, and responsive admin dashboard.
  - Comprehensive automated browser testing across 8 viewports (320px to 1920px).
- **Deliverables**:
  - `AdminDashboard.jsx` enhanced with thumbnail fix, storage validation, responsive mobile cards, and dynamic statistics.
  - `styles.css` updated with >=44px touch targets, mobile responsiveness, and touch feedback.
  - `supabase_schema.sql` safe migration.
  - Comprehensive Playwright test suite and UAT verification report.

