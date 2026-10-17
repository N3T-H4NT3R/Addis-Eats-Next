# Data and state decisions

This describes the checked-in Day 49 source. The deployed build returned different account and order behavior during the 2026-10-13 smoke test, so verify the deployment again after publishing this workspace version.

## Data and state inventory

| State/data | Current source of truth | Lifetime / refresh | Known limitation |
|---|---|---|---|
| Menu catalogue | `src/app/lib/Dishes.js` | Static in the build; changes require a deployment | No menu administration or live inventory |
| Dish detail | Server component reads the catalogue | Rendered from the same static data as the menu | No external data service |
| Account records | `src/app/lib/users.js` | Static for the server process/build | No sign-up route or durable account store; passwords are plaintext demo values |
| Session | HttpOnly `session` cookie resolved by `src/app/lib/session.js` | Cookie expires after seven days; user lookup on each API request | Cookie value is a raw user id, not a signed session token |
| Cart | Zustand `addis-eats-carts` in browser localStorage, keyed by user id | Persists in that browser until cleared | Device-local and editable by the browser owner |
| Favorites | Zustand `addis-eats-favorites` in browser localStorage, keyed by user id | Persists in that browser until cleared | Device-local; not synchronized across devices |
| Orders | `src/app/lib/orders.js` in-process array, plus client Zustand `addis-eats-orders` | Server array is lost on process restart/instance change; client copy remains in that browser | Not durable on serverless hosting; client copy is not authoritative |
| Kitchen sample orders | Hard-coded array in `src/app/api/kitchen/orders/route.js` | Recreated with the module; status overrides are held separately in memory | Updates are not a durable, shared order-state transition |
| Search/filter/pagination | URL query parameters and client menu state | Recomputed when the URL or filter changes | No server search index |

## State flow

- Public menu pages are rendered from static catalogue data.
- The browser fetches `/api/session` to resolve its current user; protected APIs must independently resolve the cookie on the server.
- Cart and favorites are local preferences. They are not server records and should not be described as synchronized or backed up.
- Checkout posts cart details to `/api/orders`. The handler assigns the owner from the server session, validates item ids/quantities against `Dishes`, and derives names, prices, and totals from the server catalogue. It still stores the order in process memory, so it is suitable only as a learning prototype.
- The orders page combines API results with the browser's local order store. The server-side durable persistence required for reliable production order history is not present.

## Empty-state verification

The deployed `/signup` route returned 404 on 2026-10-13, so the required brand-new-account journey and its first-use empty states could not be exercised. A signed-out visit to `/cart` displayed a loading state before its client session check; verify the final empty-cart, no-favorites, and no-orders messages after a new account is supported. Do not treat a loading state as a successful empty state.

## Required production change

Use a durable database for users, orders, and kitchen status; enforce ownership in every query; calculate order totals from trusted server catalogue prices; and define retention, backup, and deletion behavior. Configure credentials through the deployment platform, never in a public `NEXT_PUBLIC_*` variable.