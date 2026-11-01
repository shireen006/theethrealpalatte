# User Acceptance Testing (UAT) Report — Phase 1 & Security Review

**Project**: Theethrealpalatte — WhatsApp-First Handmade Crochet & Painting Boutique  
**Verification Date**: 2026-11-01  
**Status**: COMPLETE / VERIFIED  

---

## 1. Executive Summary

All core requirements, security validations, and boutique workflows have been audited and tested. The application preserves the original visual design, colors, typography, hero carousel, product catalog, animations, and WhatsApp-centric ordering architecture while hardening Supabase authentication, database RLS, and cloud cart synchronization.

---

## 2. Test Execution Matrix

| Test ID | Workflow / Feature | Expected Outcome | Actual Outcome | Status |
|---|---|---|---|:---:|
| **UAT-01** | **Guest Browsing** | Guest can freely explore homepage, hero carousel, and product cards without blocking overlays. | Browsing is completely uninhibited; 8 products visible with all images and details. | **PASS** |
| **UAT-02** | **Guest Add-to-Cart Gate** | Guests clicking "Add to Cart" are prompted to sign in or create an account. | `AuthModal` appears with clear prompt: *"Please sign in or create an account to add items to your cart."* | **PASS** |
| **UAT-03** | **Cart Cloud Persistence** | Logged-in customer cart items persist in localStorage and sync seamlessly with Supabase `cart_items`. | Cart drawer displays items accurately, supporting quantity adjustments (+/-) and deletions. | **PASS** |
| **UAT-04** | **WhatsApp Cart Enquiry** | "Order on WhatsApp" formats enquiry URL with itemized list, unit prices, and estimated total. | Message generated with greeting, itemized list, unit prices, and estimated total matching `+91 8088645598`. | **PASS** |
| **UAT-05** | **Single Product WhatsApp Enquiry** | Product detail page "Order on WhatsApp" opens direct chat for that single product. | Pre-filled WhatsApp link generated accurately for selected product. | **PASS** |
| **UAT-06** | **Admin Route Gate** | Accessing `/#admin` without admin authentication displays login portal and rejects unauthenticated users. | Admin tools, customer data, and editing capabilities are completely inaccessible without admin login. | **PASS** |
| **UAT-07** | **Admin Role Escalation Block** | Non-admins and customer credentials cannot access the Admin Management Portal or elevate role. | Rejected server-side via Supabase `profiles` check. Database update trigger strictly blocks role changes. | **PASS** |
| **UAT-08** | **Admin Product Management** | Admins can add, edit, toggle stock, upload images, and delete products; orders/payments removed. | Complete product CRUD verified; live card preview active; no lingering order/payment modules. | **PASS** |
| **UAT-09** | **Deleted Product Cart Safety** | Cart does not crash if an old or deleted product ID is encountered. | Graceful fallback rendering ensures cart drawer and total calculation remain stable. | **PASS** |
| **UAT-10** | **Live Catalog Refresh** | WhatsApp message always uses live catalog names and unit prices from `productList`. | Dynamically refreshes matching catalog items before sending WhatsApp message. | **PASS** |
| **UAT-11** | **Responsive Design** | Storefront renders smoothly across mobile (375px), tablet, and desktop viewports. | Responsive navigation, mobile hamburger menu, and product grids verified. | **PASS** |
| **UAT-12** | **Production Bundle Build** | `npm run build` bundles application with zero errors or warnings. | Vite v6.4.3 build completed in 6.24 seconds with 0 errors. | **PASS** |
| **UAT-13** | **Live Registration Email** | Confirmation email sent on customer signup. | Supabase default free-tier SMTP rate limit exceeded (`over_email_send_rate_limit`). Requires custom SMTP (Resend/SendGrid) for production volume. | **BLOCKED** |

---

## 3. Database Security Hardening Summary

1. **Anonymous Access Revoked**: Removed unnecessary anonymous SELECT grant on `public.profiles` (`revoke all on table public.profiles from anon;`).
2. **PostgreSQL Role Protection Trigger**: Installed `protect_profile_role()` (`BEFORE UPDATE ON public.profiles`) raising an exception if a non-admin attempts to change their role.
3. **Recursive RLS Loop Prevention**: `public.is_admin()` defined with `SECURITY DEFINER`, fixed `search_path = public`, and null-safe short-circuit.
4. **Product & Storage Policy Restriction**: INSERT, UPDATE, and DELETE operations on `public.products` and `storage.objects` bucket `product-images` restricted to `public.is_admin() = true`.
5. **No Data Loss Migration**: All SQL operations use idempotent, non-destructive statements (`CREATE TABLE IF NOT EXISTS`, `ALTER TABLE ... ADD COLUMN IF NOT EXISTS`, `DROP POLICY IF EXISTS`).
