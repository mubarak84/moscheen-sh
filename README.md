# Moscheen Schleswig-Holstein

Website der Moscheen und Gemeindezentren der **Ahmadiyya Muslim Jamaat in Schleswig-Holstein**
(Nahe/Mahdiabad, Lübeck, Kiel, Husum, Pinneberg) – gehostet auf **Cloudflare Workers** (Static Assets).

- Startseite mit Willkommens-Banner, Veranstaltungen, Rückblicken, Moschee-Kacheln, Besucherstimmen, Kontaktformular
- Detailseite je Moschee (`/moscheen/<slug>`) mit großem Bild, Ansprechpartnern, Besuchsanfrage und Feedback
- Besuchsanfrage mit Einzel-/Gruppenbesuch, bis zu 3 Wunschterminen und automatischer Antwort („Rückmeldung innerhalb von 72 Stunden“)

## Schnellstart

```bash
npm install
cp .dev.vars.example .dev.vars   # optional
npm run dev                      # http://localhost:8788
```

## Dokumentation
- [CLAUDE.md](CLAUDE.md) – Architektur, Konventionen, Projektwissen
- [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) – GitHub → Cloudflare Workers, E-Mail, Spamschutz, Checkliste
- [docs/DATABASE.md](docs/DATABASE.md) – D1, R2, Admin-Backend (Phase 2/3)
