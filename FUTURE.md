# FUTURE — deliberately cut from this capstone

These are Could items, not overlooked Must work. They are excluded until the core account, order-persistence, and release-verification gates in README.md are complete.

| Could item | Why it is deferred |
|---|---|
| Social login and password reset | Requires secure identity-provider configuration and account lifecycle design; not needed to prove the core order flow. |
| Loyalty points, coupons, and referrals | Adds pricing and abuse rules before trustworthy server-side pricing and durable orders exist. |
| Multiple restaurants and delivery-zone management | Expands menu, inventory, delivery, and staff workflows beyond the single-restaurant capstone. |
| Push notifications and live driver tracking | Requires durable event infrastructure and real delivery integrations; the current prototype has neither. |
| Analytics dashboards and marketing integrations | Adds tracking/privacy decisions without improving the essential browse-to-order journey. |
| Payments and refunds | Requires a real payment provider, compliance/security review, and operational handling; a demo should not collect payment data. |

Reconsider these only after the core flow is usable by a newly registered account, state is durable and correctly authorized, and the deployed release passes the documented verification battery.