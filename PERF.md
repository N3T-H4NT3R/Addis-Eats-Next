# Performance report

## Deployed-build measurements

Production URL: https://addis-eats-next-js-five.vercel.app/  
Measurement date: 2026-10-13  
Build/revision: **not recorded; deployed build differs from the checked-in Day 49 source**.

| Metric | Target | Deployed measurement | Status |
|---|---:|---:|---|
| Lighthouse Performance (mobile) | ≥ 90 | Not measured | Open |
| Largest Contentful Paint (mobile) | < 2.5 s | Not measured | Open |
| Cumulative Layout Shift (mobile) | < 0.1 | Not measured | Open |
| Total Blocking Time (mobile) | < 200 ms | Not measured | Open |
| Accessibility score (mobile) | ≥ 90 | Not measured | Open |
| First Load JS, `/menu` | < 120 kB | Not measured | Open |
| Largest image transfer | < 150 kB | Not measured | Open |

No Lighthouse report or physical-phone measurement was captured in this session. A menu → cart → checkout → order-history smoke flow was completed on the deployed site, but it is not a performance measurement. The estimates previously listed in this document had no saved report, revision, or reproducible run settings; they have been removed rather than presented as verified results.

## Repeatable measurement procedure

1. Deploy the exact source revision being evaluated and record its commit/deployment id.
2. Open the production URL in Chrome DevTools Lighthouse; select Mobile and Performance + Accessibility, use the default simulated throttling, and run at least three times per route in a clean profile.
3. Record each run and report the median for Performance, Accessibility, LCP, CLS, and TBT. Save the Lighthouse JSON/HTML artifact inside the Day 49 project.
4. Record `/menu` transfer/JS sizes from the deployed build and the largest image's actual transfer size from the Network panel.
5. Repeat the key flows on a real phone (viewport/device, OS, browser, network, date); check overflow, target sizes, keyboard/focus behavior, and checkout completion.

Do not substitute a local development build, an unthrottled browser timing, or estimates for the required deployed Lighthouse measurements.
