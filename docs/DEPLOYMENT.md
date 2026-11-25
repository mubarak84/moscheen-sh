# Deployment: GitHub → Cloudflare Pages

## 1. GitHub
Repository auf GitHub pushen (Branch `main`).

## 2. Cloudflare Pages-Projekt anlegen
Cloudflare Dashboard → **Workers & Pages → Create → Pages → Connect to Git** → Repository wählen.

| Einstellung | Wert |
|---|---|
| Project name | `moscheen-sh` (muss zu `name` in `wrangler.toml` passen) |
| Production branch | `main` |
| Framework preset | None |
| Build command | *(leer lassen)* |
| Build output directory | `public` |

Der Ordner `functions/` wird automatisch als Pages Functions erkannt.
Jeder Push auf `main` → Produktion; jeder andere Branch/PR → Vorschau-URL.

## 3. Variablen & Secrets
Öffentliche Variablen stehen in `wrangler.toml` unter `[vars]` – dort anpassen:
- `MAIL_FROM` – Absender mit **in Resend verifizierter Domain**
- `MAIL_ADMIN_TO` – Empfänger für Anfragen, wenn eine Moschee keine eigene `bookingEmail` hat
- `TURNSTILE_SITE_KEY` – öffentlicher Turnstile-Schlüssel

Secrets im Dashboard (**Settings → Variables and Secrets**, Typ *Secret*) oder per CLI:
```bash
npx wrangler pages secret put RESEND_API_KEY
npx wrangler pages secret put TURNSTILE_SECRET_KEY
```

## 4. E-Mail (Resend)
1. Konto auf resend.com anlegen, Domain hinzufügen, DNS-Einträge (SPF/DKIM) in Cloudflare DNS setzen.
2. API-Key erzeugen → Secret `RESEND_API_KEY`.
3. Ohne Key funktionieren die Formulare trotzdem, die E-Mails werden dann nur im Log ausgegeben
   (**Achtung:** im Live-Betrieb gehen Anfragen dann verloren – Key vor dem Livegang setzen!).

## 5. Turnstile (Spamschutz)
Dashboard → **Turnstile → Add widget** → Domain eintragen → Site Key in `wrangler.toml`,
Secret Key als Secret `TURNSTILE_SECRET_KEY`.

## 6. Eigene Domain
Pages-Projekt → **Custom domains** → Domain hinzufügen.

## Checkliste vor dem Livegang
- [ ] Impressum & Datenschutzerklärung ausgefüllt (`public/impressum.html`, `public/datenschutz.html`)
- [ ] Ansprechpartner, E-Mail-Adressen und `bookingEmail` je Moschee geprüft (`functions/_lib/seed-data.js`)
- [ ] Adresse Pinneberg eingetragen, Fotos für Husum/Pinneberg, hochauflösende Fotos für alle
- [ ] Beispiel-Veranstaltungen/Highlights/Feedback (`isExample: true`) ersetzt oder entfernt
- [ ] `RESEND_API_KEY` gesetzt, Test-Anfrage erfolgreich empfangen
- [ ] Turnstile aktiviert
