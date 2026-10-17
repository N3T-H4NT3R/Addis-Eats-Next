# Addis Eats — Day 49 capstone

Responsive food-ordering capstone built with Next.js. The current checked-in source supports browsing a static menu, client-side cart/favorites, sign-in for seeded demo users, and a checkout/order-history prototype. It is not production-ready: account registration and durable account/order storage are missing.

## Live URL and verification status

Production URL: https://addis-eats-next-js-five.vercel.app/

On 2026-10-13, a browser smoke check confirmed the home/menu render and completed the deployed demo-account journey `sign in → menu → cart → checkout → order history`; the new order appeared in the customer's list. This created demo order `ORD-1791921049752` (Doro Wot × 1, ETB 350, delivery address Bole, Addis Ababa) in the live demo environment. Unauthenticated order/session/kitchen API reads returned 401, a customer-supplied `userId` query did not change the returned order list, and an external `next` sign-in destination fell back to `/menu`. This used an existing seeded demo account, not a new account. The deployed sign-in page links to `/signup`, which currently returns 404. The live deployment and workspace source also differ. Therefore the brand-new-account flow, full live checkout battery, Lighthouse, physical-phone check, and an eight-minute spoken rehearsal are **not complete**. See [AUTH.md](AUTH.md), [DATA.md](DATA.md), and [PERF.md](PERF.md) for evidence and limitations.

## Triage and plan

### Must — release blockers

1. Reconcile the deployed build with this Day 49 source and publish only after reviewing the exact deployment diff.
2. Add real account registration backed by durable storage; fix `/signup` so it does not point at a 404.
3. Move user, order, and kitchen state into durable storage; regression-test server-side item, quantity, price, and ownership validation against the deployed revision.
4. Replace plaintext demo passwords and raw-id sessions before accepting real users.
5. Re-run the three attack checks, changed-private-id check, clean-account checkout/order journey, empty states, and production build against the deployed revision.
6. Capture Lighthouse on the deployed revision, complete keyboard and physical-phone passes, and rehearse the timed presentation aloud.

### Should — finish quality checks after blockers

- Automate API authorization, checkout validation, duplicate-submit, and empty-state tests.
- Record deployment commit, browser/device, Lighthouse settings, and results so the checks can be repeated.
- Review loading/error recovery and accessible focus return for dialogs, search, and mobile navigation.

Could items were cut to [FUTURE.md](FUTURE.md), not silently added to the release scope.

## Run from a fresh clone

1. Install Node.js 20.9 or newer.
2. From this folder, install locked dependencies with `npm ci`.
3. Copy `.env.example` to `.env.local`; set `NEXT_PUBLIC_SITE_URL=http://localhost:3000` for local development.
4. Start with `npm run dev` and open http://localhost:3000.
5. For a production-mode local check, run `npm run build`, then `npm run start`.

The available scripts are `dev`, `build`, `start`, and `lint` (see `package.json`). Do not treat an unrun check as passing.

## Environment variables

`NEXT_PUBLIC_SITE_URL` is the only application variable declared in `.env.example`. It supplies the public canonical base URL for metadata and related generated URLs; it is not a secret. Set it separately for Vercel Development, Preview, and Production, then redeploy each environment. No database/session secret is configured in this prototype; durable registration and production authentication require an explicitly configured backend before release.

## Deploy

Set this folder as the Vercel project root. `vercel.json` selects Next.js and `next build --webpack`. Set `NEXT_PUBLIC_SITE_URL` to the corresponding HTTPS URL in each deployment environment. Before promoting a build, compare the deployed commit to this folder and complete every Must item above. Do not claim production readiness while account/order data remains process-local or passwords remain plaintext.

## Eight-minute rehearsal run-of-show

Use a timer and rehearse aloud; the outline is not a substitute for completing the rehearsal.

| Time | Segment |
|---|---|
| 0:00–0:45 | User problem, target audience, and capstone goal |
| 0:45–1:35 | Live deployment, architecture, and what is in scope |
| 1:35–3:15 | Demonstrate menu → cart → checkout → order history using a clean account (currently blocked by the missing registration flow) |
| 3:15–4:20 | Authentication boundaries and the three attack results; distinguish verified smoke checks from unverified cases |
| 4:20–5:10 | Explain client/server/local state and persistence limitations |
| 5:10–6:10 | Show accessibility and performance evidence only after capturing it on the deployed build |
| 6:10–7:15 | Explain Must/Should decisions and the Could cuts in FUTURE.md |
| 7:15–8:00 | Summarize known risks, next release gates, and invite questions |
