import Link from "next/link";
import { shortOrderId } from "../lib/format";

const PAGE_SIZE = 2;
const SORTABLE_COLUMNS = {
  id: "Order",
  customer: "Customer",
  neighborhood: "Neighbourhood",
  total: "Total",
  status: "Status",
  createdAt: "Placed",
};

const money = new Intl.NumberFormat("en-ET", {
  style: "currency",
  currency: "ETB",
  maximumFractionDigits: 2,
});

function queryValue(value, fallback) {
  return typeof value === "string" && value.length ? value : fallback;
}

function makeHref(searchParams, changes) {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(searchParams)) {
    if (typeof value === "string" && value) query.set(key, value);
  }
  for (const [key, value] of Object.entries(changes)) {
    if (value == null || value === "") query.delete(key);
    else query.set(key, String(value));
  }
  const serialized = query.toString();
  return serialized ? `/dashboard?${serialized}` : "/dashboard";
}

function compareOrders(a, b, sort) {
  if (sort === "total") return Number(a.total) - Number(b.total);
  if (sort === "createdAt") return new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
  return String(a[sort] ?? "").localeCompare(String(b[sort] ?? ""), "en", {
    numeric: true,
    sensitivity: "base",
  });
}

function SortHeading({ column, label, sort, direction, searchParams }) {
  const active = sort === column;
  const nextDirection = active && direction === "asc" ? "desc" : "asc";
  const ariaSort = active ? (direction === "asc" ? "ascending" : "descending") : "none";
  return (
    <th scope="col" aria-sort={ariaSort} className="whitespace-nowrap px-4 py-3 text-left font-semibold">
      <Link
        href={makeHref(searchParams, { sort: column, direction: nextDirection, page: 1 })}
        className="inline-flex items-center gap-1 rounded focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-300 hover:text-amber-200"
      >
        {label}
        <span aria-hidden="true" className="text-amber-300">{active ? (direction === "asc" ? "↑" : "↓") : "↕"}</span>
      </Link>
    </th>
  );
}

export default function OrderTable({ orders, searchParams = {} }) {
  const sort = Object.hasOwn(SORTABLE_COLUMNS, searchParams.sort) ? searchParams.sort : "createdAt";
  const direction = searchParams.direction === "asc" ? "asc" : "desc";
  const requestedPage = Number.parseInt(searchParams.page || "1", 10);
  const pageCount = Math.max(1, Math.ceil(orders.length / PAGE_SIZE));
  const page = Number.isFinite(requestedPage) ? Math.min(Math.max(requestedPage, 1), pageCount) : 1;
  const sorted = [...orders].sort((a, b) => compareOrders(a, b, sort) * (direction === "asc" ? 1 : -1));
  const pageOrders = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const firstItem = orders.length ? (page - 1) * PAGE_SIZE + 1 : 0;
  const lastItem = Math.min(page * PAGE_SIZE, orders.length);

  return (
    <section className="overflow-hidden rounded-2xl border border-white/10 bg-[#1b1e21]">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 px-4 py-4 sm:px-5">
        <p className="text-sm text-gray-400" aria-live="polite">
          Showing <span className="font-semibold text-white">{firstItem}–{lastItem}</span> of <span className="font-semibold text-white">{orders.length}</span> orders
        </p>
        <p className="text-xs text-gray-500">Sort by selecting a column heading · 2 orders per page</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] border-collapse text-sm">
          <caption className="sr-only">Addis Eats customer orders, sortable by column and paged two at a time</caption>
          <thead className="bg-white/[0.04] text-xs uppercase tracking-wide text-gray-400">
            <tr>
              {Object.entries(SORTABLE_COLUMNS).map(([column, label]) => (
                <SortHeading key={column} column={column} label={label} sort={sort} direction={direction} searchParams={searchParams} />
              ))}
            </tr>
          </thead>
          <tbody>
            {pageOrders.length ? pageOrders.map((order) => (
              <tr key={order.id} className="border-t border-white/10 text-gray-300 transition-colors hover:bg-white/[0.025]">
                <th scope="row" className="whitespace-nowrap px-4 py-4 text-left font-semibold text-white">{shortOrderId(order.id)}</th>
                <td className="whitespace-nowrap px-4 py-4">{order.customer}</td>
                <td className="whitespace-nowrap px-4 py-4">{order.neighborhood}</td>
                <td className="whitespace-nowrap px-4 py-4 tabular-nums">{money.format(order.total)}</td>
                <td className="whitespace-nowrap px-4 py-4 capitalize">{order.status}</td>
                <td className="whitespace-nowrap px-4 py-4">{order.createdAt ? new Intl.DateTimeFormat("en-ET", { dateStyle: "medium", timeZone: "UTC" }).format(new Date(`${order.createdAt.slice(0, 10)}T00:00:00Z`)) : "—"}</td>
              </tr>
            )) : (
              <tr><td colSpan={6} className="px-4 py-10 text-center text-gray-400">No orders match this view.</td></tr>
            )}
          </tbody>
        </table>
      </div>
      {pageCount > 1 ? (
        <nav aria-label="Order table pages" className="flex items-center justify-between border-t border-white/10 px-4 py-4 sm:px-5">
          {page > 1 ? (
            <Link rel="prev" href={makeHref(searchParams, { page: page - 1 })} className="inline-flex min-h-11 items-center rounded-lg border border-white/10 px-3 text-sm font-semibold hover:border-amber-300/40 hover:text-amber-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-300">← Previous</Link>
          ) : <span className="inline-flex min-h-11 items-center rounded-lg border border-white/5 px-3 text-sm text-gray-600" aria-disabled="true">← Previous</span>}
          <p className="text-sm text-gray-400">Page <span className="font-semibold text-white">{page}</span> of {pageCount}</p>
          {page < pageCount ? (
            <Link rel="next" href={makeHref(searchParams, { page: page + 1 })} className="inline-flex min-h-11 items-center rounded-lg border border-white/10 px-3 text-sm font-semibold hover:border-amber-300/40 hover:text-amber-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-300">Next →</Link>
          ) : <span className="inline-flex min-h-11 items-center rounded-lg border border-white/5 px-3 text-sm text-gray-600" aria-disabled="true">Next →</span>}
        </nav>
      ) : null}
    </section>
  );
}
