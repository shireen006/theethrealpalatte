# Phase 2 Context — Complete Website Functionality, Supabase Database & Touchscreen Optimization

## 1. Phase Boundaries & Decisions

### Locked Constraints
- **Preserve Aesthetic & Branding**: Homepage layout, brand identity, soft blush/cream/espresso palette, Playfair Display & Cormorant Garamond typography, hero carousel, product catalog cards, handmade cat animation, crochet/bloom/paintings/accessories sections are strictly preserved.
- **WhatsApp-First Ordering**: WhatsApp number `+91 8088645598`. No payment gateways, Razorpay, or checkout forms.
- **Supabase Backend**: Permanent database with PostgreSQL `profiles`, `products`, `cart_items` tables, and `product-images` storage bucket.

### Specific Problem Diagnoses & Solutions
1. **Thumbnail Duplication Bug in Admin Dashboard**:
   - *Problem*: In `AdminDashboard.jsx`, products with empty/null `image` fall back to the exact same Unsplash photo (`https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?w=200`).
   - *Solution*: Map each product to its own verified boutique catalog image asset (`sunflowerbouquet`, `sunflowerkeychain`, `fourleafcloverkeychain`, `butterflyhairtie`, `bowhairtie`, `bluedreambouquet`, `crimsonlilybouquet`, `miniforeverbouquet`), both in `AdminDashboard.jsx` and `main.jsx`.
2. **Product & Image Management**:
   - Image upload to `product-images` bucket with type check (`image/*`) and size validation (`<= 5MB`).
   - Pre-save image previews.
   - Deletion of replaced/deleted storage files when safe.
3. **Stock & Availability Automation**:
   - Stock quantity field.
   - When stock reaches 0, `is_available` is automatically set to `false`.
   - Manual toggle between available and out-of-stock.
4. **Dynamic Database Statistics**:
   - Total products (`products.length`).
   - In-stock count (`products.filter(p => (p.stock > 0 || p.stock === undefined) && p.is_available !== false).length`).
   - Out-of-stock count (`products.filter(p => p.stock === 0 || p.is_available === false).length`).
   - Category distribution (Crochet, Bloom Studio, Paintings, Accessories, Custom).
5. **Touchscreen Optimization**:
   - Minimum 44px touch targets on buttons, quantity controls, cart drawer actions, nav toggles.
   - Remove any hover-only functionality so all features work reliably via touch.
   - Smooth dropdowns, no horizontal scrolling.
   - Admin dashboard responsive view (cards on mobile/tablet, table on desktop).
