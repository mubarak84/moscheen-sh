# Deployment: GitHub → Cloudflare Workers

Die Website läuft als **Cloudflare Worker mit Static Assets**:
- `public/` = statische Dateien (HTML, CSS, JS, Bilder) – werden direkt von Cloudflare ausgeliefert
- `src/index.js` = Worker (Router) für `/api/*`, `/moscheen/*` und `/media/*`
- `functions/` = die eigentlichen Routen-Handler

## 1. GitHub
Repository auf GitHub pushen (Branch `main`).

## 2. Worker mit GitHub verbinden (Workers Builds)
Cloudflare Dashboard → **Workers & Pages → Create → Import a repository** → Repository wählen.

| Einstellung | Wert |
|---|---|
| Project / Worker name | `moscheen-sh` (muss zu `name` in `wrangler.toml` passen) |
| Build command | *(leer lassen)* |
| Deploy command | `npx wrangler deploy` |
| Root directory | `/` |

Jeder Push auf `main` → Produktion. Für Vorschau-Versionen anderer Branches:
Worker → **Settings → Build → Branch control** → „Builds for non-production branches“ aktivieren
(Deploy-Befehl dort: `npx wrangler versions upload`).

Wichtig: In `wrangler.toml` darf **kein** `pages_build_output_dir` stehen – sonst hält
`wrangler deploy` das Projekt für ein Pages-Projekt und bricht ab.

## 3. Variablen & Secrets
Öffentliche Variablen stehen in `wrangler.toml` unter `[vars]` – dort anpassen:
- `MAIL_FROM` – Absender mit **in Resend verifizierter Domain**
- `MAIL_ADMIN_TO` – Empfänger für Anfragen, wenn eine Moschee keine eigene `bookingEmail` hat
- `TURNSTILE_SITE_KEY` – öffentlicher Turnstile-Schlüssel

Secrets im Dashboard (**Worker → Settings → Variables and Secrets**, Typ *Secret*) oder per CLI:
```bash
npx wrangler secret put RESEND_API_KEY
npx wrangler secret put TURNSTILE_SECRET_KEY
```
Hinweis: Variablen (`[vars]`) aus `wrangler.toml` überschreiben beim Deploy die im Dashboard
gesetzten Klartext-Variablen – Secrets bleiben erhalten.

## 4. E-Mail (Resend)
1. Konto auf resend.com anlegen, Domain hinzufügen, DNS-Einträge (SPF/DKIM) in Cloudflare DNS setzen.
2. API-Key erzeugen → Secret `RESEND_API_KEY`.
3. Ohne Key funktionieren die Formulare trotzdem, die E-Mails werden dann nur im Log ausgegeben
   (**Achtung:** im Live-Betrieb gehen Anfragen dann verloren – Key vor dem Livegang setzen!).
   Logs: Worker → **Observability / Logs**.

## 5. Turnstile (Spamschutz)
Dashboard → **Turnstile → Add widget** → Domain eintragen → Site Key in `wrangler.toml`,
Secret Key als Secret `TURNSTILE_SECRET_KEY`.

## 6. Eigene Domain
Worker → **Settings → Domains & Routes → Add → Custom domain**.
Die Standard-Adresse lautet `https://moscheen-sh.<konto>.workers.dev`.

## Checkliste vor dem Livegang
- [ ] Impressum & Datenschutzerklärung ausgefüllt (`public/impressum.html`, `public/datenschutz.html`)
- [ ] Ansprechpartner, E-Mail-Adressen und `bookingEmail` je Moschee geprüft (`functions/_lib/seed-data.js`)
- [ ] Adresse Pinneberg eingetragen, Fotos für Husum/Pinneberg, hochauflösende Fotos für alle
- [ ] Beispiel-Veranstaltungen/Highlights/Feedback (`isExample: true`) ersetzt oder entfernt
- [ ] `RESEND_API_KEY` gesetzt, Test-Anfrage erfolgreich empfangen
- [ ] Turnstile aktiviert
