"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useOrderStore } from "../store/orderStore";
import OrderTable from "../orders/OrderTable";
import RevenueChart from "./RevenueChart";
import DashboardLoading from "./loading";
import { downloadCsv, toCsv } from "../lib/csv";
import { etb, when } from "../lib/format";

const money = new Intl.NumberFormat("en-ET", {
  style: "currency",
  currency: "ETB",
  maximumFractionDigits: 0,
});

function getDateKey(value) {
  const date = new Date(value);
  return Number.isNaN(date.valueOf()) ? null : date.toISOString().slice(0, 10);
}

function formatDate(value) {
  return new Intl.DateTimeFormat("en-ET", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${value}T00:00:00Z`));
}

function createDashboardData(orders) {
  const eligibleOrders = orders.filter(
    (order) => order.status !== "cancelled" && Number.isFinite(Number(order.total))
  );
  const revenueByNeighborhoodMap = new Map();
  const ordersByDateMap = new Map();

  for (const order of eligibleOrders) {
    const neighborhood = order.deliveryAddress?.split(",")[0]?.trim() || "Unspecified";
    revenueByNeighborhoodMap.set(
      neighborhood,
      (revenueByNeighborhoodMap.get(neighborhood) || 0) + Number(order.total)
    );
    const date = getDateKey(order.createdAt);
    if (date) ordersByDateMap.set(date, (ordersByDateMap.get(date) || 0) + 1);
  }

  const revenueByNeighborhood = [...revenueByNeighborhoodMap]
    .map(([neighborhood, revenue]) => ({ neighborhood, revenue }))
    .sort((a, b) => b.revenue - a.revenue);
  const dates = [...ordersByDateMap.keys()].sort();
  const ordersByDay = [];

  if (dates.length) {
    const cursor = new Date(`${dates[0]}T00:00:00Z`);
    const end = new Date(`${dates.at(-1)}T00:00:00Z`);
    while (cursor <= end) {
      const date = cursor.toISOString().slice(0, 10);
      ordersByDay.push({ date, orders: ordersByDateMap.get(date) || 0 });
      cursor.setUTCDate(cursor.getUTCDate() + 1);
    }
  }

  const dateRange = dates.length
    ? `${formatDate(dates[0])} – ${formatDate(dates.at(-1))}`
    : "No order dates yet";
  const chartSummary = { revenueByNeighborhood, ordersByDay, dateRange };
  const tableRows = orders.map((order) => ({
    id: order.id,
    customer: order.customer?.username || (order.userId ? `User ${order.userId}` : "Guest"),
    neighborhood: order.deliveryAddress?.split(",")[0]?.trim() || "Unspecified",
    total: Number(order.total) || 0,
    status: order.status || "unknown",
    createdAt: order.createdAt || "",
  }));
  const totalRevenue = eligibleOrders.reduce((sum, order) => sum + Number(order.total), 0);
  const avgOrderValue = eligibleOrders.length ? totalRevenue / eligibleOrders.length : 0;

  return { orders, chartSummary, tableRows, totalRevenue, avgOrderValue };
}

function DashboardError() {
  return (
    <main className="min-h-[70vh] bg-[#111315] px-4 py-16 text-white sm:px-8">
      <section role="alert" className="mx-auto max-w-xl rounded-3xl border border-red-400/20 bg-[#1b1e21] p-8 text-center">
        <p className="text-sm font-bold uppercase tracking-[0.2em] text-red-300">Could not load analytics</p>
        <h1 className="mt-3 text-3xl font-extrabold">Dashboard unavailable</h1>
        <p className="mt-3 text-gray-400">The order summary could not be loaded. Please try again.</p>
        <Link href="/dashboard" className="mt-6 inline-flex min-h-11 items-center rounded-xl bg-amber-400 px-5 font-bold text-[#171717] hover:bg-amber-300 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-amber-300">
          Try again
        </Link>
      </section>
    </main>
  );
}

function EmptyState() {
  return (
    <div className="rounded-2xl border border-dashed border-white/15 bg-[#1b1e21] p-8 text-center">
      <h2 className="text-lg font-bold text-white">No orders saved in this browser</h2>
      <p className="mt-2 text-gray-400">This demo keeps orders in browser storage. Orders placed on another device or browser are not shared without a backend database.</p>
    </div>
  );
}

export default function DashboardClient({ initialData, searchParams, demo, isAdmin }) {
  const ordersByUser = useOrderStore((state) => state.ordersByUser);
  const [storageHydrated, setStorageHydrated] = useState(false);

  useEffect(() => {
    const persistence = useOrderStore.persist;
    if (!persistence || persistence.hasHydrated()) {
      queueMicrotask(() => setStorageHydrated(true));
      return undefined;
    }

    return persistence.onFinishHydration(() => setStorageHydrated(true));
  }, []);

  const orders = useMemo(() => {
    const mergedOrders = new Map(
      (initialData.orders || []).map((order) => [String(order.id), order])
    );
    const browserOrders = Object.values(ordersByUser || {}).flatMap((userOrders) =>
      Array.isArray(userOrders) ? userOrders : []
    );

    for (const order of browserOrders) {
      if (order?.id != null) mergedOrders.set(String(order.id), order);
    }

    return demo === "empty" ? [] : [...mergedOrders.values()];
  }, [demo, initialData.orders, ordersByUser]);

  const data = useMemo(() => createDashboardData(orders), [orders]);

  function exportOrderHistory() {
    const rows = orders.map((order) => ({
      orderId: order.id,
      customer: order.customer?.username || (order.userId ? `User ${order.userId}` : "Guest"),
      customerId: order.userId || "",
      status: order.status || "unknown",
      items: (order.items || []).map((item) => `${item.name} x ${item.quantity}`).join("; "),
      total: etb(order.total),
      deliveryAddress: order.deliveryAddress || "",
      phone: order.phone || "",
      placedAt: order.createdAt ? when(order.createdAt) : "",
    }));
    downloadCsv("addis-eats-all-customer-orders.csv", toCsv(rows));
  }

  if (!storageHydrated) return <DashboardLoading />;
  if (demo === "error") return <DashboardError />;
  const { chartSummary, tableRows, totalRevenue, avgOrderValue } = data;

  return (
    <main className="min-h-screen bg-[#111315] px-4 py-10 text-white sm:px-8 sm:py-14">
      <div className="mx-auto max-w-7xl">
        <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-amber-300">Addis Eats · Staff</p>
            <h1 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl">Dashboard</h1>
            <p className="mt-2 text-sm text-gray-400">A clear view of neighbourhood sales and order activity.</p>
          </div>
          <Link href="/kitchen" className="inline-flex min-h-11 items-center rounded-xl border border-white/10 px-4 text-sm font-semibold text-gray-200 hover:border-amber-300/50 hover:text-amber-200 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-amber-300">
            Kitchen orders <span className="ml-2" aria-hidden="true">↗</span>
          </Link>
        </header>

        <p className="mb-6 text-sm text-gray-500">Order history is read from this browser’s saved checkout data; it is not shared across devices.</p>

        {orders.length === 0 ? (
          <EmptyState />
        ) : (
          <>
            <section aria-label="Order summary" className="mb-6 grid gap-4 sm:grid-cols-3">
              <article className="rounded-2xl border border-white/10 bg-[#1b1e21] p-5">
                <p className="text-sm text-gray-400">Total orders</p>
                <p className="mt-2 text-3xl font-extrabold">{orders.length}</p>
              </article>
              <article className="rounded-2xl border border-white/10 bg-[#1b1e21] p-5">
                <p className="text-sm text-gray-400">Revenue</p>
                <p className="mt-2 text-3xl font-extrabold">{money.format(totalRevenue)}</p>
              </article>
              <article className="rounded-2xl border border-white/10 bg-[#1b1e21] p-5">
                <p className="text-sm text-gray-400">Average order</p>
                <p className="mt-2 text-3xl font-extrabold">{money.format(avgOrderValue)}</p>
              </article>
            </section>
            <RevenueChart summary={chartSummary} />
            <section aria-labelledby="orders-heading" className="mt-8">
              <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-amber-300">Order management</p>
                  <h2 id="orders-heading" className="mt-1 text-2xl font-bold">Recent orders</h2>
                </div>
                {isAdmin && (
                  <button
                    type="button"
                    onClick={exportOrderHistory}
                    className="inline-flex min-h-11 items-center rounded-xl border border-amber-300/30 px-4 text-sm font-semibold text-amber-200 transition hover:border-amber-300/60 hover:bg-amber-300/10 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-amber-300"
                  >
                    Export Orders CSV
                  </button>
                )}
              </div>
              <OrderTable orders={tableRows} searchParams={searchParams} />
            </section>
          </>
        )}
        <p className="sr-only">Revenue values are shown in Ethiopian birr. Order trend values are counts per day.</p>
      </div>
    </main>
  );
}
