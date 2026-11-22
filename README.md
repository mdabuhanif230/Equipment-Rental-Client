# RentGear - Equipment Rental Platform

RentGear is a full-stack equipment rental marketplace where customers discover and book verified
equipment, owners publish listings and track earnings, and administrators moderate users and
rental activity.

## Live Project

- **Website:** https://rentgear-ivory.vercel.app
- **API:** https://equipment-rental-server.onrender.com
- **API Health:** https://equipment-rental-server.onrender.com/api/health
- **Client Repository:** https://github.com/mdabuhanif230/Equipment-Rental-Client
- **Server Repository:** https://github.com/mdabuhanif230/Equipment-Rental-Server

## Assignment Submission

| Item | Details |
| --- | --- |
| Project | RentGear - Equipment Rental Platform |
| Assignment | Assignment 9 - Category 003 |
| Admin Email | `mhabuhanif230@gmail.com` |
| Admin Password | `Hanif15387126` |
| Live Site | https://rentgear-ivory.vercel.app |

## Key Features

### Public Experience

- Responsive animated landing page built with Framer Motion
- High-quality hero banner and live equipment search
- Six featured approved listings
- Popular category, benefits, how-it-works, reviews, and owner sections
- Server-filtered equipment catalogue with search, location, category, rental type, price, availability, sorting, and pagination
- Dedicated loading, error, and not-found pages

### Authentication and Roles

- Email/password registration and login
- Password validation: minimum 6 characters with uppercase and lowercase letters
- Google sign-in
- JWT bearer authentication for protected API requests
- Customer, owner, and admin role-based access control
- Session restoration after page reload
- Profile, photo, password, phone, and address management

### Customer Dashboard

- Rental history with payment and booking status
- Favorite equipment and saved equipment removal
- Equipment booking for a selected date range and quantity
- Live stock availability and rental total calculation
- Stripe Checkout payment flow
- Server-verified payment success and cancellation pages
- Rental reviews for completed rentals

### Owner Dashboard

- Add, view, edit, and delete equipment listings
- ImgBB image upload or direct image URL
- Automatic return of edited listings to pending status
- Owner-specific equipment and rental records
- Monthly earnings and completed-rental analytics
- Mark paid and confirmed rentals as completed

### Admin Dashboard

- Platform totals and monthly booking charts
- Users-by-role analytics
- Search, role filtering, role changes, suspend, and restore
- Equipment approval and rejection
- Platform-wide booking monitoring
- Cancel unpaid pending rentals or complete paid rentals

### Optional Enhancements

- Dark and light theme with browser persistence
- 35-minute unpaid booking holds
- Automated booking expiration and completed-rental updates
- Optional Resend email notifications
- Server-side pagination and URL-persisted catalogue filters

## Stripe Test Payment

The deployed API currently uses Stripe test credentials. Use this test card:

| Field | Value |
| --- | --- |
| Card Number | `4242 4242 4242 4242` |
| Expiry | Any future date, for example `12/30` |
| CVC | Any three digits, for example `123` |
| ZIP | Any five digits, for example `12345` |

This card performs a safe Stripe test transaction and does not charge real money.

## Technology Stack

| Area | Technology |
| --- | --- |
| Framework | Next.js 16 App Router |
| Language | TypeScript |
| UI | Tailwind CSS 4, DaisyUI-style components, shadcn-style primitives |
| Animation | Framer Motion |
| Charts | Recharts |
| Icons | Lucide React |
| Notifications | React Hot Toast |
| Authentication | Better Auth and JWT bearer sessions |
| Image Hosting | ImgBB |
| Payment | Stripe Checkout |

## Route Map

| Route | Access | Purpose |
| --- | --- | --- |
| `/` | Public | Landing page |
| `/all-equipment` | Public | Searchable and filterable catalogue |
| `/equipment/[id]` | Private | Equipment details, favorites, booking, and reviews |
| `/login` | Public | Email or Google sign-in |
| `/register` | Public | Account registration |
| `/dashboard/customer/*` | Customer | Rentals, favorites, and overview |
| `/dashboard/owner/*` | Owner | Equipment, bookings, and analytics |
| `/dashboard/admin/*` | Admin | Users, equipment, rentals, and analytics |
| `/profile` | Authenticated | Personal profile and security settings |
| `/payment/success` | Authenticated | Payment verification and confirmation |
| `/payment/cancel` | Authenticated | Retry or cancel an unpaid booking |
| `/about`, `/contact` | Public | Platform information |

## Local Setup

Requirements:

- Node.js 20 or newer
- npm
- Running MongoDB or MongoDB Atlas
- The Express API

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open `http://localhost:3000`.

## Environment Variables

Create `.env.local` from `.env.example`.

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_API_URL` | Express API base URL, normally `http://localhost:5000/api` |
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | Google OAuth Web Client ID |
| `NEXT_PUBLIC_IMGBB_API_KEY` | ImgBB public upload API key |
| `NEXT_PUBLIC_SITE_URL` | Public website URL |

Never place MongoDB credentials, Stripe secret keys, or OAuth client secrets in the client
environment. `NEXT_PUBLIC_*` variables are browser-visible and are not a replacement for
server-side secret storage.

## Scripts

```bash
npm run dev
npm run build
npm run start
npm run lint
```

## Deployment

The client is deployed on Vercel. Configure these production variables in the Vercel project:

```env
NEXT_PUBLIC_API_URL=https://equipment-rental-server.onrender.com/api
NEXT_PUBLIC_GOOGLE_CLIENT_ID=<google-web-client-id>
NEXT_PUBLIC_IMGBB_API_KEY=<imgbb-api-key>
NEXT_PUBLIC_SITE_URL=https://rentgear-ivory.vercel.app
```

Redeploy after changing `NEXT_PUBLIC_*` variables because Next.js embeds public environment
variables into the build.

## Project Structure

```text
src/
  app/            App Router pages and layouts
  components/     Navigation, cards, tables, charts, modals, and UI
  context/        Authentication and theme providers
  lib/            API client, types, formatting, and image upload helpers
public/
  images/         Local image assets
```
