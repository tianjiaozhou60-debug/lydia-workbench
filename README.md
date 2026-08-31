# Lydia Workbench

Responsive personal workbench for HANMA automotive LED export sales, IELTS 6.5 study, overseas social content, customer intelligence, and spreadsheet workflows.

## Run locally

```powershell
pnpm install --config.enable-global-virtual-store=false --config.node-linker=hoisted
pnpm build
pnpm preview
```

The current MVP stores changes in the browser and exports CRM records as UTF-8 CSV for Excel/WPS. It is installable as a PWA after production deployment.

## Secure cloud architecture

- Frontend: this React PWA, deployed over HTTPS.
- Authentication and sync: Supabase Auth/Postgres or another authenticated backend with row-level access control.
- AI, web intelligence, email, and social integrations: server-side functions only.
- Secrets: keep AI/search/provider secrets on the server. Never store them in `localStorage` or `VITE_*` variables.

Cross-device sync and live intelligence require a selected cloud project and provider credentials. The UI deliberately does not pretend that browser-only storage is cloud sync.

## GitHub Pages

The workflow in `.github/workflows/deploy-pages.yml` publishes every push to `main`. In the repository settings, choose **Pages > Source > GitHub Actions** once.

## Supabase

Run `supabase/schema.sql` in the Supabase SQL Editor. The schema uses Supabase Auth IDs and row-level security, so each signed-in user can only access their own data. The anonymous browser key may be configured at build time; service-role and AI provider keys must never be exposed to the frontend.
