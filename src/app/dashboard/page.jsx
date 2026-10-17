import Link from "next/link";
import { redirect } from "next/navigation";
import DashboardClient from "./DashboardClient";
import { getOrders } from "../lib/orders";
import { getSession } from "../lib/session";

export const metadata = {
  title: "Dashboard",
  description: "Addis Eats sales and order analytics.",
  robots: { index: false, follow: false },
};

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

async function createDashboardData(demo) {
  if (demo === "loading") {
    await new Promise((resolve) => setTimeout(resolve, 1200));
  }
  if (demo === "error") {
    throw new Error("Dashboard error state demonstration");
  }

  const storedOrders = await getOrders();
  const orders = demo === "empty" ? [] : storedOrders;
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
      <section
        role="alert"
        className="mx-auto max-w-xl rounded-3xl border border-red-400/20 bg-[#1b1e21] p-8 text-center"
      >
        <p className="text-sm font-bold uppercase tracking-[0.2em] text-red-300">Could not load analytics</p>
        <h1 className="mt-3 text-3xl font-extrabold">Dashboard unavailable</h1>
        <p className="mt-3 text-gray-400">The order summary could not be loaded. Please try again.</p>
        <Link
          href="/dashboard"
          className="mt-6 inline-flex min-h-11 items-center rounded-xl bg-amber-400 px-5 font-bold text-[#171717] hover:bg-amber-300 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-amber-300"
        >
          Try again
        </Link>
      </section>
    </main>
  );
}

export default async function DashboardPage({ searchParams }) {
  const session = await getSession();
  if (!session) redirect("/signin?next=%2Fdashboard");
  if (session.role !== "staff" && session.role !== "admin") redirect("/menu");

  const params = await searchParams;
  const demo = params?.demo;
  let data;
  try {
    data = await createDashboardData(demo);
  } catch (error) {
    console.error("Unable to load dashboard data:", error);
  }

  if (!data) return <DashboardError />;
  return <DashboardClient initialData={data} searchParams={params || {}} demo={demo} isAdmin={session.role === "admin"} />;
}
