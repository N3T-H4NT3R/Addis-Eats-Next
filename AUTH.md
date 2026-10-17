# Authentication and authorization

## Scope and current status

The deployed app at https://addis-eats-next-js-five.vercel.app/ was smoke-tested on 2026-10-13. The workspace source and deployed build are not identical: the deployed sign-in page links to `/signup`, but that URL returns 404; this workspace's sign-in page instead links to support and has no registration route. No new-account flow can therefore be completed against the current deployment.

The checks below establish only the behaviors actually observed. They do not certify the app as production-secure. The workspace implementation uses a static user list and plaintext demo passwords in `src/app/lib/users.js`, and the session cookie contains the user's id. Do not use real credentials or personal data.

## Route protection in the workspace source

| Route | Intended access | Enforcement in source | Important limitation |
|---|---|---|---|
| `/`, `/menu`, `/menu/[id]` | Public | No auth required | Public content |
| `/cart` | Signed-in experience | Client requests `/api/session` | Not protected by `src/proxy.js`; the route itself can be opened without a session |
| `/checkout` | Signed-in customer | Proxy checks cookie presence; checkout and `POST /api/orders` resolve the session | Cookie presence is only a routing check; the API session check is authoritative |
| `/orders` | Customer's orders; admins see all | Proxy checks cookie; `GET /api/orders` filters by server session id, except admin | Order storage is in process memory in this workspace source |
| `/favorites` | Signed-in experience | Client session plus Zustand state | Favorites are browser-local, not server-authorized records |
| `/kitchen` | Staff or admin | API read and every status PATCH call `getSession()` and check role | Workspace GET route returns a hard-coded sample list |
| `/signin` | Guest | Open-redirect destination is restricted in the client | Workspace has no registration route |

`src/proxy.js` checks for a session cookie on `/checkout`, `/kitchen`, and `/orders`, and redirects signed-in visitors away from `/signin`. The cookie check does not validate the user. Protected APIs call `getSession()` from `src/app/lib/session.js`, which looks up the cookie id in the static `users` array.

## API checks in the workspace source

| Endpoint | Check |
|---|---|
| `POST /api/auth/login` | Looks up a matching email and password; sets an HttpOnly session cookie on success |
| `POST /api/auth/logout` | Deletes the session cookie |
| `GET /api/session` | Returns the current session or 401 |
| `GET /api/orders` | Returns only records matching `session.id`; admins may see all |
| `POST /api/orders` | Derives `userId` from `session.id`, ignoring a supplied owner id |
| `GET /api/kitchen/orders` | Requires staff/admin; otherwise 401 or 403 |
| `PATCH /api/kitchen/orders/[id]` | Re-checks staff/admin role and validates the requested status |

## Three attack checks on the deployed URL

Tested 2026-10-13 against https://addis-eats-next-js-five.vercel.app/:

1. **Unauthenticated API access:** without a session, `GET /api/orders`, `GET /api/session`, and `GET /api/kitchen/orders` each returned 401. This verifies the deployed API rejects these unauthenticated reads; it is not a test of every protected endpoint.
2. **Changed user id:** after signing in as a customer, `GET /api/orders` and `GET /api/orders?userId=1` returned the same customer-scoped order list (the returned records had `userId: "3"`). Changing the query id did not expose the other user's records. The deployed `/api/orders/[id]/stream` URL returned 404, so a path-id stream authorization check was not verified.
3. **Open redirect:** signing in at `/signin?next=https://example.com` ended at `/menu`, not the external host.

These are smoke checks on one deployed build, not a full penetration test. Re-run them after deploying the current workspace source, and include a private order id belonging to a different customer once registration and durable order storage are available.

## Security gaps to resolve before real use

- Replace plaintext demo passwords with a password-hashing scheme and remove public demo credentials.
- Replace the raw user-id cookie with a signed, expiring session and rotate/revoke sessions on logout.
- Add durable account storage, registration validation, rate limiting, and account lifecycle handling.
- Persist orders in a database. The Day 49 workspace source now derives prices from the server-side dish catalogue, but this change is not yet deployed or verified against production.
- Add automated authorization tests for each private read and write, including changed path ids and role escalation.