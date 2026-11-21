<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## RentGear client instructions

- This directory is the customer-facing Next.js application. Keep client changes inside this project unless the task also explicitly requires backend work.
- Before changing Next.js APIs or conventions, read the relevant guide under `node_modules/next/dist/docs/` from this directory. The generated Next.js block above is maintained by `next dev`; preserve it.
- Use the App Router under `src/app/`, shared UI under `src/components/`, auth/theme state under `src/context/`, and shared API/types/formatting helpers under `src/lib/`. Reuse existing patterns before introducing a new abstraction or dependency.
- Make API requests through `src/lib/api.ts`. Its base URL is `NEXT_PUBLIC_API_URL` (default `http://localhost:5000/api`); do not hard-code API URLs in pages or components.
- Treat browser-only APIs such as `localStorage` and `document` as client-only. Follow the existing AuthContext, ThemeContext, and route guard patterns so server rendering remains safe.
- Enforce role-based page access with the existing guards and use the server as the authority for permissions, payment state, booking totals, and resource ownership. Never expose server credentials in `NEXT_PUBLIC_*` variables or client code.
- Keep UI responsive and consistent with the existing teal/amber design system, DaisyUI/Tailwind styles, shared components, loading/error/empty states, and toast feedback.
- Preserve established API contracts and types in `src/lib/types.ts`; coordinate endpoint or schema changes with `../equipment-rental-server` when the task calls for backend changes.
- Available commands: `npm run dev`, `npm run lint`, `npm run build`. The dev site runs on `http://localhost:3000`; the API defaults to `http://localhost:5000`.
