# RentGear — Equipment Rental Platform (Client)

**Project name:** RentGear
**Purpose:** The customer-facing web application for an equipment rental marketplace: customers search and rent verified tools and machines, owners list their gear and track earnings, and administrators moderate the whole platform — with bookings paid through Stripe.

- **Live URL:** _deploy this client to Vercel and set `NEXT_PUBLIC_API_URL` to your hosted API (see [Environment variables](#environment-variables))._
- **API / backend repository:** [`../equipment-rental-server`](../equipment-rental-server) (Express + MongoDB + Stripe)
- **Local dev URL:** http://localhost:3000

---

## Key features

### Public
- **Animated home page** — hero banner with live search, 6 featured listings, category tiles, "why choose us", "how it works", a community review wall (≥4 reviews) and an owner recruitment band, all animated with Framer Motion.
- **All Equipment** — server-side search, location, category, rental-type, price-range and availability filters plus sorting (newest / price asc / price desc) and windowed pagination. Every filter lives in the URL, so filtered views are shareable and refresh-safe.
- **Equipment details** — gallery, spec sheet, rental terms, reviews with a star summary, and a live availability/price calculator.

### Customers (private)
- **Booking modal** — start/end date, quantity, phone, delivery address and notes; the estimated total is fetched from the availability endpoint before anything is sent.
- **Stripe checkout** — creating a booking redirects to Stripe Checkout (35-minute stock hold), with dedicated **payment success** and **payment cancel** pages that verify the payment *on the server*.
- **Customer dashboard** — KPI cards, a booking-status donut chart, bookings table (pay / cancel / view) and a favorites grid.
- **Favorites** — heart any listing from the catalogue or the details page.
- **Reviews** — only customers with a completed rental of that item can post a review (one per booking).

### Owners
- **Owner dashboard** — total listings, completed rentals, total earnings and a monthly earnings area chart fed by real MongoDB aggregations.
- **Listing management** — create, edit and delete equipment; new/edited items go back to `pending` until an admin approves them.
- **Bookings table** — mark paid, confirmed rentals as completed.

### Admins
- **Admin dashboard** — six KPI cards, bookings-per-month bar chart and users-by-role donut.
- **User management** — search, role filter and inline role changes (customer ↔ owner ↔ admin).
- **Moderation** — approve or reject equipment listings with status filters.
- **All bookings** — platform-wide table with payment status.

### Platform
- **Auth:** email/password register & login (uppercase + lowercase + minimum 6 characters, enforced on both sides), Google social login (Google users always receive the `customer` role), JWT access tokens kept in `localStorage` with a silent `/auth/me` refresh — reloading a private page never bounces a logged-in user to `/login`.
- **RBAC:** `customer`, `owner` and `admin` roles are checked by `verifyToken` / `verifyRenter` / `verifyOwner` / `verifyAdmin` on the API, and mirrored by client-side route guards.
- **UX:** toasts for every action, loading skeletons, dedicated loading/error/404 pages, responsive layout down to mobile, and a persisted **dark/light theme toggle** (stored in `localStorage`, applied before first paint).
- **Design system:** one brand palette (teal + amber), one type scale (`.section-title`, `.eyebrow`, `.section-subtitle`), consistent cards, tables and buttons across every page.

---

## Tech stack

| Area | Packages |
| --- | --- |
| Framework | `next` 16 (App Router, Turbopack, Cache Components, React Compiler), `react` 19, `react-dom` 19 |
| Language | TypeScript |
| Styling | `tailwindcss` 4, `daisyui` 5 |
| Animation | `framer-motion` |
| Charts | `recharts` |
| Icons | `lucide-react` |
| Notifications | `react-hot-toast` |
| HTTP | `fetch` (wrapped in `src/lib/api.ts` with Bearer token handling) |

---

## Getting started

```bash
# 1. install dependencies (Windows PowerShell: use npm.cmd)
npm install

# 2. configure the environment
cp .env.example .env.local
#    then edit .env.local

# 3. run the dev server
npm run dev
```

The Express API must be running (default `http://localhost:5000`) and its `CLIENT_URLS` must include `http://localhost:3000`.

### Environment variables

| Key | Required | Purpose |
| --- | --- | --- |
| `NEXT_PUBLIC_API_URL` | ✅ | Base URL of the API, e.g. `http://localhost:5000/api` |
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | ⬜ | OAuth client id for the Google sign-in button (must match the server's `GOOGLE_CLIENT_ID`) |
| `NEXT_PUBLIC_SITE_URL` | ⬜ | Public URL of this app |

All frontend configuration is read from these env vars — no secrets are hard-coded, and MongoDB credentials live only on the server.

### Scripts

```bash
npm run dev     # start the dev server
npm run build   # production build (type-checks too)
npm run start   # serve the production build
npm run lint    # ESLint 9 (next lint was removed in Next 16)
```

---

## Route map

| Route | Access | Purpose |
| --- | --- | --- |
| `/` | public | Landing page (banner, featured, categories, why-us, reviews, extras) |
| `/all-equipment` | public | Catalogue with server-side filters, sort and pagination |
| `/equipment/[id]` | private | Details, favorites, booking modal, reviews |
| `/login`, `/register` | public | Auth (Google login included) |
| `/payment/success`, `/payment/cancel` | private | Stripe return pages with server-side verification |
| `/dashboard/customer`, `/bookings`, `/favorites` | customer | Customer dashboard |
| `/dashboard/owner`, `/equipment`, `/bookings` | owner | Owner dashboard + listing CRUD |
| `/dashboard/admin`, `/users`, `/equipment`, `/bookings` | admin | Admin dashboard + moderation |
| `/profile` | all roles | Name, email, photo, phone, address |
| `/about`, `/contact` | public | Company info, contact form, FAQ |
| `loading.tsx`, `error.tsx`, `not-found.tsx` | — | Loading, error and 404 states |

---

## Project structure

```
src/
├── app/                  # App Router pages, layouts, loading/error/404
│   ├── (auth)/           #   login, register
│   ├── all-equipment/    #   catalogue (search/filter/sort)
│   ├── equipment/[id]/   #   details + booking
│   ├── payment/          #   success, cancel
│   ├── dashboard/        #   customer, owner, admin areas
│   ├── profile/ about/ contact/
│   ├── error.tsx, loading.tsx, not-found.tsx
├── components/           # Navbar, Footer, cards, tables, charts, modals
├── context/              # AuthContext (JWT session), ThemeContext (dark mode)
├── lib/                  # api client, shared types, formatting helpers
└── public/images/        # hand-made SVG artwork (hero, auth, owners, placeholder)
```
