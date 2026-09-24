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

## Learning and phone sync

The built-in IELTS core vocabulary, highlighted reading words, examples, and reading paragraphs use the device's English text-to-speech voice. Word cards show IPA, Chinese meaning, an English example, and its translation. On mobile, tap the word or sentence to hear it. The external IELTS exam pages are embedded from another site; this app cannot add dictionary controls inside that site's iframe.

The foreign-trade vocabulary module includes an agricultural LED lighting glossary, online word capture, IPA, Chinese meanings, bilingual examples, related words, spaced review, and device text-to-speech. Unknown words, phrases, and sentences are enriched through public dictionary, sentence-corpus, and translation services, then saved as editable study cards. Learners can classify each lookup as IELTS English, international trade English, or automotive LED terminology.

To enable cross-device IELTS progress sync:

1. Create a Supabase project, enable email/password sign-in, and run `supabase/schema.sql` in its SQL Editor.
2. For local testing, put the project URL and **public anon key** in `.env.local` as `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`. Never use the service-role key in the browser.
3. For GitHub Pages, the deployment workflow must first be updated to pass `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` into the build. That workflow update requires GitHub `workflow` permission and is not part of this release. Then add those values as a repository variable and secret and redeploy.
4. Open the deployed HTTPS site on both devices, use the cloud button to sign in with the same account, and verify a completed item or saved foreign-trade word appears on the other device. If email confirmation is enabled, confirm the signup email first.

Until those values are configured and the site is deployed, learning records remain in each browser's local storage and **do not sync between devices**. CRM and other workbench modules remain browser-local even after IELTS sync is enabled.

## GitHub Pages

The workflow in `.github/workflows/deploy-pages.yml` publishes every push to `main`. In the repository settings, choose **Pages > Source > GitHub Actions** once.

## Supabase

Run `supabase/schema.sql` in the Supabase SQL Editor. The schema uses Supabase Auth IDs and row-level security, so each signed-in user can only access their own data. The anonymous browser key may be configured at build time; service-role and AI provider keys must never be exposed to the frontend.
