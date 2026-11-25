# CLAUDE.md – Projektwissen „Moscheen Schleswig-Holstein“

Read this file first in every session. It is the single source of project knowledge.
Code comments and docs are English; **all user-facing text is German** (use proper
umlauts ä ö ü ß, formal "Sie").

## 1. Purpose

Website of the **Ahmadiyya Muslim Jamaat** in **Schleswig-Holstein** (Germany).
It presents all mosques/centres of the region and lets visitors request a visit.

Features (phase 1 – live):
- Start page: big welcome hero banner + introduction, banners for **upcoming events**
  and **highlights** of recent programmes, **tiles** (thumbnails) of all mosques,
  recent visitor impressions, contact form.
- Mosque detail page `/moscheen/<slug>`: big picture, description, address, contact
  persons, CTA **„Besuch anfragen“** (booking dialog), visitor feedback (list + form).
- Booking dialog: visit type (Einzel/Gruppe/Schulklasse/…), group size, up to 3
  preferred date+time slots, interests, name, email, phone, message, privacy consent.
  On success the UI shows: *„Ihr Terminvorschlag wird geprüft – wir melden uns
  innerhalb von 72 Stunden.“* and an auto-reply email goes to the visitor.
- Legal pages required in Germany: `/impressum`, `/datenschutz` (contain placeholders!).

Later phases (prepared, not active): D1 database, R2 images, admin backend
(protected by Cloudflare Access) to maintain mosques/events/feedback/bookings.

## 2. Mosques (seed data in `functions/_lib/seed-data.js`)

| slug       | Name                          | Address                                  | Status |
|------------|-------------------------------|------------------------------------------|--------|
| nahe       | Bait-ul-Baseer Moschee on the Mahdiabad complex ("Mehdiabad Baitul Basir" = one site) | Wakendorfer Straße 11, 23866 Nahe   | opened 25.10.2019 by Hadhrat Mirza Masroor Ahmad (aba) |
| luebeck    | Bait-ul-Afiyat Moschee        | Kaninchenborn 4a, 23560 Lübeck           | opened 2011 |
| kiel       | Habib Moschee                 | Flintbeker Straße 7, 24113 Kiel          | |
| husum      | Mahmood Moschee               | Robert-Koch-Straße 33, 25813 Husum       | |
| pinneberg  | Gemeindezentrum Pinneberg     | **address unknown – placeholder**        | |

Sources: ahmadiyya.de/gebetsstaette/moscheen/* (Nov 2026). Contact persons in seed
data are placeholders except where listed on ahmadiyya.de – the owner must verify.
Photos `public/assets/img/mosques/{kiel,luebeck,nahe}.jpg` come from ahmadiyya.de
(340×212, low-res → replace with high-res). Husum/Pinneberg use `placeholder.svg`.
Events, highlights and feedback in the seed data are **examples** (`isExample: true`).

To add a mosque now: add an object to `MOSQUES` in `seed-data.js` (+ image).
Later: insert a row into D1 (`db/schema.sql`) or use the admin backend.

## 3. Hosting & stack (Cloudflare requirements)

- **Cloudflare Pages**, connected to the GitHub repo (branch `main` = production,
  other branches = preview deployments).
- Pages settings: Framework preset **None**, Build command **(empty)**,
  Build output directory **`public`**. Config lives in `wrangler.toml`
  (`pages_build_output_dir = "public"`). Because `wrangler.toml` exists it is the
  source of truth for bindings; **secrets** are set in the dashboard / `wrangler pages secret put`.
- **No build step, no framework.** Plain HTML + CSS + ES modules in `public/`.
- **Pages Functions** in `functions/` (file-based routing, ES modules,
  `export const onRequestGet/onRequestPost`). Workers runtime – no Node APIs
  (use `fetch`, `crypto.subtle`, `HTMLRewriter`). `compatibility_date` in wrangler.toml.
- Files/folders starting with `_` in `functions/` are not routes (`_lib`, `_middleware.js`).
- Static headers: `public/_headers`; redirects: `public/_redirects`.

## 4. Architecture

```
public/                 static frontend (served as-is)
  index.html            start page
  moschee.html          detail page template (served by functions/moscheen/[slug].js)
  impressum.html, datenschutz.html, 404.html
  assets/css/styles.css single stylesheet (CSS custom properties, mobile first)
  assets/js/api.js      ALL fetch calls to /api/* (only place that knows endpoints)
  assets/js/ui.js       shared helpers (escape HTML, date formatting, header/nav, toast)
  assets/js/home.js     start page (hero slider, tiles, news, impressions, contact form)
  assets/js/mosque.js   detail page rendering
  assets/js/cards.js    shared card renderers (events, highlights, feedback)
  assets/js/booking.js  booking dialog (<dialog>) + submit
  assets/js/forms.js    contact + feedback forms, Turnstile loader, generic submit handler
  assets/js/page.js     simple pages (Impressum, Datenschutz, 404)
  _headers, _redirects, robots.txt
functions/
  _middleware.js        global error handling + security headers (CSP) for function responses
  _lib/detail.js        loadMosqueDetail() – shared by API and SSR route
  _lib/public.js        publicMosque() – strips internal fields (bookingEmail) from API output
  _lib/repository.js    DATA ACCESS LAYER: getRepository(env) → D1Repository if env.DB
                        is bound, otherwise SeedRepository (seed-data.js). Same interface.
  _lib/seed-data.js     phase-1 data (mosques, events, highlights, feedback)
  _lib/email.js         sendEmail() via Resend REST API; dev fallback = console.log
  _lib/email-templates.js German email texts (admin notification + visitor auto-reply)
  _lib/validation.js    input validation/sanitising (server side is authoritative)
  _lib/security.js      Turnstile verification, honeypot, rate limit (KV, optional)
  _lib/http.js          json()/error() helpers
  _lib/access.js        Cloudflare Access JWT verification for admin routes
  api/config.js         GET public config (Turnstile site key) for the frontend
  api/mosques/index.js  GET list
  api/mosques/[slug].js GET detail (incl. contacts + approved feedback)
  api/events.js         GET upcoming events (?mosque=slug)
  api/highlights.js     GET recent highlights
  api/feedback.js       GET approved feedback, POST new (→ pending/moderation)
  api/bookings.js       POST visit request → DB (if bound) + emails
  api/contact.js        POST contact form → email
  api/admin/*           future backend; guarded by _middleware.js (Access JWT)
  moscheen/[slug].js    serves moschee.html with SEO meta + inlined JSON (HTMLRewriter)
  media/[[path]].js     serves images from R2 bucket (binding MEDIA) – phase 2
db/migrations/0001_initial.sql  D1 schema (add new numbered files, never edit applied ones)
db/seed.sql             GENERATED from seed-data.js by `npm run db:seed:generate`
scripts/generate-seed-sql.mjs
docs/                   DATABASE.md (DB plan), DEPLOYMENT.md (step-by-step + go-live checklist)
```

Header/footer are rendered by `initLayout()` in ui.js into `[data-layout="header|footer"]`
– change navigation/footer there, not in each HTML file.
CSP forbids inline scripts and `style="…"` attributes – use CSS classes.

**Golden rule:** the frontend never contains data. It always calls `/api/*`. The API
always goes through `getRepository(env)`. Switching to D1 = bind `DB` in wrangler.toml
and run migrations + `db/seed.sql` (see docs/DATABASE.md); no frontend change.

Repository interface (keep both implementations in sync!):
`listMosques()`, `getMosque(slug)`, `listContacts(mosqueId)`, `listEvents({mosque, limit})`,
`listHighlights({limit})`, `listFeedback({mosque, limit})`, `createFeedback(data)`,
`createBooking(data)`, `createContactMessage(data)`.

## 5. Bindings, vars & secrets

| Name                    | Kind      | Phase | Purpose |
|-------------------------|-----------|-------|---------|
| `DB`                    | D1        | 2     | main database `moscheen-sh-db` |
| `MEDIA`                 | R2        | 2     | images bucket `moscheen-sh-media`, served at `/media/*` |
| `RATE_LIMIT`            | KV        | opt.  | simple per-IP rate limiting of form POSTs |
| `RESEND_API_KEY`        | secret    | 1     | email API key (Resend). Missing → emails are only logged |
| `TURNSTILE_SECRET_KEY`  | secret    | 1     | spam protection; missing → only honeypot check |
| `TURNSTILE_SITE_KEY`    | var       | 1     | public key, delivered via `/api/config` |
| `MAIL_FROM`             | var       | 1     | e.g. `Ahmadiyya SH <noreply@DOMAIN>` (domain verified in Resend) |
| `MAIL_ADMIN_TO`         | var       | 1     | fallback recipient for bookings/contact |
| `ACCESS_TEAM_DOMAIN`, `ACCESS_AUD` | var | 3 | Cloudflare Access for `/api/admin/*` |

Booking emails go to the mosque's `bookingEmail` (if set) else `MAIL_ADMIN_TO`.

## 6. Conventions & rules

- German UI text, formal "Sie". Honorifics as used by the community: (as), (aba), (saw).
- **GDPR (DSGVO)**: no Google Fonts / external CDNs / embedded maps or YouTube without
  consent. Use system fonts; map = external link to OpenStreetMap. Every form needs a
  privacy-consent checkbox linking to `/datenschutz`. Don't log full personal data.
- Accessibility: semantic HTML, labels for every input, focus styles, alt texts,
  `prefers-reduced-motion` respected, contrast AA.
- Always escape data before inserting into HTML (`escapeHtml` in ui.js / HTMLRewriter).
- Validate on client (UX) **and** server (security). Server limits are in validation.js.
- Feedback is never published automatically: status `pending` → admin approves.
- Keep functions small; shared logic goes to `functions/_lib/`.
- No secrets in the repo. `.dev.vars` (local secrets) is git-ignored; see `.dev.vars.example`.

## 7. Local development

```bash
npm install          # only installs wrangler (dev dependency)
npm run dev          # wrangler pages dev → http://localhost:8788
```
Without `RESEND_API_KEY` the email content is printed in the wrangler console.
Local D1 (phase 2): `npm run db:seed:generate`, `npm run db:migrate:local`, `npm run db:seed:local`.
Visual check without a browser tool: headless Edge
`msedge --headless=new --virtual-time-budget=5000 --screenshot=out.png --window-size=1400,3000 http://127.0.0.1:8788/`
(min. width ≈ 500 px in headless mode). Smoke test: curl the /api/* endpoints.

## 8. Status / roadmap

- [x] Phase 1: frontend, API with seed data, booking/contact/feedback forms, email via Resend
- [ ] Owner TODO: fill Impressum/Datenschutz, verify contacts, real photos, Pinneberg address,
      verify Resend domain, set secrets, Turnstile widget
- [ ] Phase 2: create D1 + R2, bind in wrangler.toml, run schema/seed, upload images to R2
- [ ] Phase 3: admin backend `/admin` (Cloudflare Access) – CRUD for mosques, contacts,
      events, highlights; moderate feedback; manage bookings (status confirmed/declined)
