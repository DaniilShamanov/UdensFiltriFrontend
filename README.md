# Plumbing Web App (Next.js App Router + next-intl)

This project is a create-next-app style Next.js (App Router) frontend scaffolded from a Figma Make export.

## Tech
- Next.js (App Router)
- TailwindCSS
- next-intl (lv/ru first, en placeholder)
- Cookie-based auth scaffold (JWT in HttpOnly cookies: access/refresh) prepared for Django backend

## Getting started

1) Copy env template and set your API base URL:

```bash
cp .env.example .env.local
```

2) Install deps and run:

```bash
npm install
npm run dev
```

Open http://localhost:3000

## Internationalization

Locales:
- Latvian: `/lv`
- Russian: `/ru`
- English (placeholder): `/en`

Messages live in `src/messages/*.json`.

## Backend integration (Django)

The API wrapper lives in:
- `src/lib/api.ts`

It is configured to:
- send cookies (`credentials: 'include'`)
- automatically attach CSRF header (`X-CSRFToken`) when a `csrftoken` cookie exists

Auth endpoint placeholders are in:
- `src/lib/auth/api.ts`

Adjust endpoint paths to match your Django/DRF setup.

## Protected routes

Protected paths (client + middleware):
- `/account`
- `/orders`
- `/checkout`
- `/payment`

Client-side guard component:
- `src/components/auth/ClientProtected.tsx`

## SEO

- `src/app/sitemap.ts`
- `src/app/robots.ts`
- page metadata is set in `src/app/[locale]/layout.tsx`

