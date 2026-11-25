# Moscheen Schleswig-Holstein

Monorepo fuer eine Website ueber Moscheen in Schleswig-Holstein.

## Tech Stack

- Frontend: Next.js (TypeScript) in `apps/web`
- Backend: AWS Amplify Gen 2 Ressourcen in `amplify`
- Hosting: AWS Amplify Hosting

## Projektstruktur

```txt
.
|- apps/
|  |- web/            # Next.js App (Coming Soon)
|- amplify/
|  |- auth/           # Amplify Auth resource
|  |- data/           # Amplify Data schema/resource
|  |- storage/        # Amplify Storage resource
|  |- backend.ts      # Backend composition
|- packages/
|  |- ui/             # spaeter: shared UI components
|  |- config/         # spaeter: shared configs
```

## Lokal starten

1. Dependencies installieren:

   ```bash
   npm install
   ```

2. Frontend starten:

   ```bash
   npm run dev
   ```

3. Amplify Sandbox starten (spaeter fuer Backend-Entwicklung):

   ```bash
   npm run backend:sandbox
   ```

## AWS Amplify Hosting

Beim Erstellen der Amplify App als Build Command `npm run build` und als Output `.next` verwenden (Next.js SSR Setting in Amplify aktivieren).
