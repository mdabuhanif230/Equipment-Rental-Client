# RentGear — Equipment Rental Platform (Client)

**Project name:** RentGear
**Purpose:** The customer-facing web application for an equipment rental marketplace: customers search and rent verified tools and machines, owners list their gear and track earnings, and administrators moderate the whole platform — with bookings paid through Stripe.

- **Live URL:** https://equipment-rental-client-nine.vercel.app
- **Live API:** https://equipment-rental-server-two.vercel.app
- **API / backend repository:** https://github.com/mdabuhanif230/Equipment-Rental-Server (local: [`../equipment-rental-server`](../equipment-rental-server))
- **Client repository:** https://github.com/mdabuhanif230/-Equipment-Rental-Client-
- **Local dev URL:** http://localhost:3000

### Submission details (Assignment 9 — Category 003)
- **Admin Email:** `mhabuhanif230@gmail.com`
- **Admin Password:** `Hanif15387126` _(demo credential for evaluator only)_
- **Live Site Link:** https://equipment-rental-client-nine.vercel.app
- **GitHub Repository (server):** https://github.com/mdabuhanif230/Equipment-Rental-Server
- **GitHub Repository (client):** https://github.com/mdabuhanif230/-Equipment-Rental-Client-

---

## Key features

### Public
- **Animated home page** — hero banner with live search, 6 featured listings, category tiles, "why choose us", "how it works", a community review wall (≥4 reviews) and an owner recruitment band, all animated with Framer Motion.
- **All Equipment** — server-side search, location, category, rental-type, price-range and availability filters plus sorting (newest / price asc / price desc) and windowed pagination. Every filter lives in the URL, so filtered views are shareable and refresh-safe.
- **Footer** — contact details and a social link using the current X brand mark (not the retired Twitter bird).
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
- **All bookings** — platform-wide table with payment status and safe admin actions to cancel unpaid pending bookings or complete paid rentals.

### Platform
- **Auth:** Better Auth email/password register & login (uppercase + lowercase + minimum 6 characters), Google social login (Google users default to `customer`), and Better Auth JWTs used for protected API requests. Sessions refresh on reload without bouncing a logged-in user to `/login`.
- **RBAC:** `customer`, `owner` and `admin` roles are checked by `verifyToken` / `verifyRenter` / `verifyOwner` / `verifyAdmin` on the API, and mirrored by client-side route guards.
- **UX:** toasts for every action, loading skeletons, dedicated loading/error/404 pages, responsive layout down to mobile, and a persisted **dark/light theme toggle** (stored in `localStorage`, applied before first paint).
- **Design system:** one brand palette (ink + deep teal + coral + lime), one type scale (`.section-title`, `.eyebrow`, `.section-subtitle`), consistent cards, tables and buttons across every page.

---

## Tech stack

| Area | Packages |
| --- | --- |
| Framework | `next` 16 (App Router, Turbopack, Cache Components, React Compiler), `react` 19, `react-dom` 19 |
| Language | TypeScript |
| Styling | `tailwindcss` 4 with custom design tokens + shadcn-style UI primitives (`components/ui`) |
| Animation | `framer-motion` |
| Charts | `recharts` |
| Icons | `lucide-react` |
| Notifications | `react-hot-toast` |
| HTTP | Better Auth session cookies plus `fetch` (wrapped in `src/lib/api.ts` with JWT Bearer handling for protected API requests) |

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
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | ⬜ | OAuth Web Client ID for Google sign-in (must match the server's `GOOGLE_CLIENT_ID`; no client secret is needed for ID-token sign-in) |
| `NEXT_PUBLIC_IMGBB_API_KEY` | ⬜ | ImgBB key for owner equipment and profile photo uploads |
| `NEXT_PUBLIC_SITE_URL` | ⬜ | Public URL of this app |

All frontend configuration is read from these env vars. Do not put database credentials, Stripe
secret keys, OAuth client secrets, or other server secrets in the client environment. MongoDB and
Stripe credentials belong only in the server's `.env`.

The ImgBB key is a public upload key used for direct equipment and profile photo uploads. If it is omitted, users can still submit an existing image URL, but local file uploads are unavailable.

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
| `/dashboard` | all roles | Redirects each role to its own overview (also the Google sign-in callback target) |
| `/dashboard/customer`, `/bookings`, `/favorites` | customer | Customer dashboard, rentals and favorites |
| `/dashboard/owner`, `/add-equipment`, `/equipment`, `/bookings` | owner | Owner dashboard + listing CRUD |
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
