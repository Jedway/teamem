# Teamem — Implementation Plan

Tea e-commerce MVP. TanStack Start + React + TS + shadcn/ui, storage via Vercel Blob (JSON blobs), deploy target Vercel. WhatsApp-based checkout, no auth on storefront, hardcoded admin login. Build in the phase order below — each phase should be independently runnable/demoable before moving to the next.

Scaffold (`npx @tanstack/cli create teamem`, Tailwind add-on) and `npx shadcn@latest init` are already done before this plan starts.

---

## Phase 1 — Data layer & foundation

**Goal:** storage layer, schema, seed data, base layout — nothing user-facing yet.

- Install `@vercel/blob`.
- Define types:
  ```ts
  type Item = {
    id: string
    name: string
    description: string
    price: number        // NGN, integer
    stock: number
    category: string      // freeform for now, taxonomy TBD
    image: string | null  // blob URL or null -> use placeholder
    status: "in_stock" | "low_stock" | "sold_out"
  }

  type OrderLine = { itemId: string; name: string; qty: number; unitPrice: number }

  type Order = {
    id: string
    items: OrderLine[]
    total: number
    status: "checked_out" | "purchased" | "returned"
    createdAt: string   // ISO
    updatedAt: string
    receiptUrl: string | null
  }
  ```
- `status` is derived, not hand-set by the admin for in_stock/low_stock/sold_out:
  - `stock === 0` → `sold_out`
  - `stock <= LOW_STOCK_THRESHOLD` (constant, default `5`) → `low_stock`
  - else → `in_stock`
- Server-side storage module (`app/lib/storage.ts` or similar) wrapping `@vercel/blob`:
  - `getInventory()`, `saveInventory(items)`
  - `getOrders()`, `saveOrders(orders)`
  - Read-modify-write whole-file; fine at MVP scale.
  - Local dev fallback: read/write actual JSON files on disk if `process.env.VERCEL` isn't set, so Jed isn't burning Blob calls in dev. Same function signatures either way.
- Seed script or one-time server function to populate `inventory.json` with 6–8 dummy tea products (varied categories, prices, a couple with `stock: 0`, one with low stock) and an empty `orders.json`.
- Base layout: root route with `<Outlet />`, global styles, shadcn `Toaster` mounted once.
- Placeholder image asset for items with `image: null` (static file in `public/`).

**Exit criteria:** seed data loads server-side, confirmed via a temp debug route or log — no UI required yet.

---

## Phase 2 — Landing page (`/`)

- Transparent header, fixed/sticky at top, becomes solid on scroll (optional nicety, skip if time-constrained).
- Header: logo (made-up placeholder wordmark), **Contact** / **About** links — collapse into a shadcn `Sheet` hamburger menu below `md` breakpoint.
- Hero: headline, subheadline, single CTA button **"SHOP"** → `/shop`.
- Use a free stock photo (Unsplash source or similar) for hero background/image — placeholder, swappable later.
- Fully responsive: hero stacks, header collapses.

**Exit criteria:** `/` renders, CTA navigates to `/shop`, works at mobile width.

---

## Phase 3 — Storefront (`/shop`)

- Fetch inventory via a server function (`createServerFn` loader on the route).
- Grid of product cards: image (or placeholder), name, price, category, status badge.
  - `sold_out` cards: greyed out (reduced opacity + disabled controls), not addable to cart.
  - `low_stock` cards: badge shown but still purchasable.
- Search bar at top + **price range filter** (min/max fields or a shadcn `Slider`) — client-side filter over the fetched list is fine at this scale.
- Default sort: alphabetical by name.
- **Quantity selector lives on the product card** (stepper: −, qty, +), bounded by `stock`. Adding to cart uses whatever qty is set on the card at that moment.
- Cart state: React context or a small store (e.g. Zustand — lightweight, one dependency) holding `{ itemId, name, unitPrice, qty }[]`. Persist to `sessionStorage` (not `localStorage` — fine either way, but session is enough for a demo) so a refresh doesn't nuke the cart. No server persistence needed for cart-in-progress.
- Floating **"GO TO CART"** pill: fixed bottom-right, cart icon + item count badge, opens the cart (drawer/sheet or dedicated `/shop/cart` route — drawer is less navigation, prefer that).
- **Cart drawer/view:** line items editable here too — clicking a line item lets you adjust qty or remove it (same stepper component, reused).

**Exit criteria:** can search, filter by price, add/edit/remove items from cart, cart persists across a refresh, sold-out items are visibly disabled.

---

## Phase 4 — WhatsApp checkout

- Cart view has a **"Purchase [WhatsApp icon]"** button.
- Build the message client-side from cart state:
  ```
  Hi, goodday, I'd like to purchase the following:
  {name} {qty}x₦{unitPrice formatted with commas}
  ...
  Total: ₦{total formatted}
  thank you very much.
  ```
- URL-encode the message, build the link: `https://wa.me/2348073094612?text=<encoded>`.
- On click:
  1. POST the order to a server function → appends to `orders.json` with `status: "checked_out"`, `createdAt`/`updatedAt` = now, `receiptUrl: null`.
  2. Decrement `stock` on each purchased item in `inventory.json` (re-derive status).
  3. Open the `wa.me` link (new tab).
  4. Clear the local cart.
- Format currency with `Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN" })` or manual comma formatting to match the `₦10,000` style exactly.

**Exit criteria:** completing checkout creates an order record, decrements stock, opens WhatsApp with a correctly formatted message.

---

## Phase 5 — Admin auth (`/admin`)

- Hardcoded credential check (`ememette` / `ememette#`) in a server function — do the comparison server-side, don't ship the password to the client bundle.
- On success, set a simple signed/httpOnly session cookie (short-lived is fine, no real auth system needed — a flag cookie checked by a route guard is enough for MVP).
- `/admin` is the login form; successful login redirects to `/admin/inventory` (or a shared `/admin/dashboard` shell with tabs).
- Route guard (loader-level check) on all `/admin/*` routes except the login itself — redirect to `/admin` if no valid session cookie.

**Exit criteria:** wrong credentials rejected with an inline error; correct credentials get in and persist across a refresh; direct-navigating to an admin subroute while logged out redirects to login.

---

## Phase 6 — Admin: Inventory tab

- Table/grid of all items: name, category, price, stock, status badge (**IN STOCK** green / **LOW STOCK** yellow / **SOLD OUT** red — derived, not manually set).
- "Add item" form (dialog or dedicated route): name, description, price, stock, category, optional image upload → Vercel Blob (`put()`), falls back to placeholder if skipped.
- Edit / delete existing items (reuse the add form for edit).
- All writes go through the same `saveInventory` storage function from Phase 1.

**Exit criteria:** admin can add/edit/delete an item and see status badges update correctly as stock changes.

---

## Phase 7 — Admin: Purchase History tab

- Two sections/tabs: **CHECKED OUT** and **PURCHASED**, filtered from the same `orders.json` by `status`.
- **CHECKED OUT** rows: timestamp, line items, total, and actions:
  - **SOLD** → `status: "purchased"`, update `updatedAt`.
  - **RETURNED** → remove from `CHECKED OUT` (either delete the record or set `status: "returned"` and exclude it from both visible tabs — prefer keeping the record with `status: "returned"` for a clean audit trail rather than hard-deleting).
  - Edit line items / quantities inline (covers WhatsApp renegotiation) — recalculate `total` on save. This does **not** re-adjust inventory stock automatically; that was already decremented at checkout time (flag this as a judgment call — note it in the demo so the client can confirm the behavior they want).
  - Receipt upload button present (PDF/image), **wired to do nothing** for MVP — just a disabled-looking or no-op button, per spec.
- **PURCHASED** rows: same data, read-mostly (no SOLD/RETURNED actions), plus whatever's needed for Phase 8's export.

**Exit criteria:** an order created in Phase 4 shows up under CHECKED OUT; SOLD/RETURNED move it correctly; line-item edits persist.

---

## Phase 8 — PDF export

- Client-side: `jspdf` + `jspdf-autotable`.
- On the PURCHASED tab: date-range picker (shadcn `Calendar`/date-range component), filters the list client-side.
- "Export PDF" button builds a table (date, items, qty, total) from the filtered rows and triggers a download.

**Exit criteria:** exported PDF matches the filtered date range and totals shown on screen.

---

## Phase 9 — Responsive & deploy polish

- Pass over every screen at mobile width (admin included, even though not explicitly spec'd as a priority — cheap to get right now).
- Confirm Blob env vars (`BLOB_READ_WRITE_TOKEN`) are documented in a `.env.example` and set in Vercel project settings.
- Confirm no filesystem writes happen outside the Phase 1 storage module (grep for stray `fs.writeFile` calls).
- `vercel.json` / build settings check — TanStack Start's Vercel adapter should need close to zero config, but verify the build output target is set correctly.

**Exit criteria:** clean `vercel deploy` (or preview deploy), full flow works end-to-end on the deployed URL: browse → filter → cart → WhatsApp checkout → admin login → inventory edit → order resolution → PDF export.

---

## Open items still owned by Jed (not blockers, but flag before final handoff)
- Real logo/colors/fonts — currently placeholder/made-up.
- Product category taxonomy — currently freeform strings.
- Whether editing a CHECKED OUT order's quantities should also adjust inventory stock (Phase 7 note above).
