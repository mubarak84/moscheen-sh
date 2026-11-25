# Datenbank & Speicher in Cloudflare – Empfehlung

## Überblick: Welcher Cloudflare-Dienst wofür?

| Bedarf | Dienst | Binding | Warum |
|---|---|---|---|
| Strukturierte Daten (Moscheen, Ansprechpartner, Termine, Feedback, Anfragen) | **D1** (SQLite) | `DB` | Relationale Daten mit Abfragen/Filtern; kostenloses Kontingent reicht für diese Website mehr als aus |
| Bilder (Moscheefotos, Veranstaltungsbilder, Porträts) | **R2** (Object Storage) | `MEDIA` | Kein Egress-Kostenrisiko, Auslieferung über `/media/*` |
| Rate-Limit / Zwischenspeicher | **KV** (optional) | `RATE_LIMIT` | Einfache Schlüssel-Wert-Daten mit Ablaufzeit |
| E-Mail-Versand | **Resend** (REST-API) | Secret `RESEND_API_KEY` | Einfach, zuverlässig, funktioniert direkt mit `fetch` |
| Spamschutz | **Turnstile** | `TURNSTILE_*` | Datenschutzfreundliche CAPTCHA-Alternative von Cloudflare |
| Admin-Login | **Cloudflare Access** (Zero Trust) | `ACCESS_*` | Kein eigenes Passwortsystem nötig; Login per E-Mail-Code / Google / Microsoft |

Für Bilder kann später zusätzlich **Cloudflare Images** (Größenanpassung) genutzt werden – für den Start reicht R2.

## Datenmodell (D1)

Schema: [`db/migrations/0001_initial.sql`](../db/migrations/0001_initial.sql)

```
mosques ──┬── contacts        (Ansprechpartner je Moschee)
          ├── events          (mosque_id NULL = landesweit)
          ├── highlights      (Rückblicke)
          ├── feedback        (status: pending → approved / rejected)
          ├── bookings        (status: new → confirmed / declined / done / cancelled)
          └── contact_messages
admin_users                    (E-Mail aus Cloudflare Access → Rolle + Moschee)
```

Wichtige Entscheidungen:
- **`slug`** (z. B. `kiel`) ist die URL `/moscheen/kiel` – nach dem Livegang nicht mehr ändern.
- **`booking_email`** je Moschee: Empfänger der Besuchsanfragen (wird nie öffentlich ausgegeben).
- **Feedback wird moderiert**: neue Einträge sind `pending` und erscheinen erst nach Freigabe.
- **Personenbezogene Daten** (bookings, contact_messages) nach Aufbewahrungsfrist löschen –
  Vorschlag: Cron-Trigger (Phase 3), der Einträge älter als 12 Monate entfernt.

## Umstellung von Seed-Daten auf D1 (Phase 2)

```bash
# 1. Datenbank anlegen – die ausgegebene database_id kopieren
npx wrangler d1 create moscheen-sh-db

# 2. In wrangler.toml den Block [[d1_databases]] einkommentieren und die ID eintragen

# 3. Schema + Startdaten lokal testen
npm run db:seed:generate        # erzeugt db/seed.sql aus functions/_lib/seed-data.js
npm run db:migrate:local
npm run db:seed:local
npm run dev                     # Website liest jetzt aus der lokalen D1

# 4. Produktion
npm run db:migrate:remote
npm run db:seed:remote
git commit -am "D1 anbinden" && git push   # Cloudflare deployt automatisch
```

Sobald `env.DB` vorhanden ist, nutzt `getRepository(env)` automatisch die `D1Repository`-Klasse
(`functions/_lib/repository.js`). Frontend und API-Routen bleiben unverändert.

Spätere Schemaänderungen: neue Datei `db/migrations/0002_….sql` anlegen und
`npm run db:migrate:remote` ausführen – niemals bestehende Migrationen ändern.

## Bilder in R2 (Phase 2)

```bash
npx wrangler r2 bucket create moscheen-sh-media
# wrangler.toml: [[r2_buckets]] einkommentieren
npx wrangler r2 object put moscheen-sh-media/mosques/kiel/hero.jpg --file=./kiel-hero.jpg --remote
```

Danach in der Datenbank `image = '/media/mosques/kiel/hero.jpg'` setzen.
Empfohlene Ordnerstruktur: `mosques/<slug>/hero.jpg`, `mosques/<slug>/gallery/…`,
`events/<id>.jpg`, `contacts/<id>.jpg`. Bilder vorher auf max. 2000 px Breite und WebP/JPEG (~300 KB) verkleinern.

## Admin-Backend (Phase 3) – Vorschlag

1. **Cloudflare Zero Trust → Access → Application** anlegen für
   `<domain>/admin*` und `<domain>/api/admin*`; erlaubte E-Mails der Verantwortlichen eintragen.
2. `ACCESS_TEAM_DOMAIN` und `ACCESS_AUD` in `wrangler.toml` setzen
   (→ `functions/api/admin/_middleware.js` prüft das JWT bereits).
3. Admin-Oberfläche `public/admin/index.html` + API-Routen für CRUD:
   Moscheen, Ansprechpartner, Veranstaltungen, Highlights, Feedback freigeben,
   Besuchsanfragen bestätigen (mit automatischer Bestätigungs-E-Mail an den Besucher),
   Bild-Upload nach R2.
4. Rollen über `admin_users`: `admin` = alle Moscheen, `editor` = nur eigene Moschee.

Vorhanden sind bereits: `GET /api/admin/bookings`, `GET/PATCH /api/admin/feedback`.
