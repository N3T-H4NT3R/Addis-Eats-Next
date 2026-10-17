"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useOrderStore } from "../store/orderStore";
import { etb, shortOrderId, when } from "../lib/format";
import { downloadCsv, toCsv } from "../lib/csv";

const EMPTY_ORDERS = [];

const STATUS_COLORS = {
  confirmed: "bg-blue-500/10 text-blue-400",
  preparing: "bg-orange-500/10 text-orange-400",
  ready: "bg-yellow-500/10 text-yellow-400",
  delivered: "bg-green-500/10 text-green-400",
};

export default function OrdersPage() {
  const [user, setUser] = useState(null);
  const [sessionLoaded, setSessionLoaded] = useState(false);
  const [serverOrders, setServerOrders] = useState(EMPTY_ORDERS);
  const [fetchError, setFetchError] = useState("");

  const clientOrders = useOrderStore((state) =>
    user
      ? state.ordersByUser?.[String(user.id)] ?? EMPTY_ORDERS
      : EMPTY_ORDERS
  );

  useEffect(() => {
    let cancelled = false;

    async function loadData() {
      try {
        const sessionRes = await fetch("/api/session", {
          cache: "no-store",
        });

        if (!sessionRes.ok) {
          if (!cancelled) setSessionLoaded(true);
          return;
        }

        const sessionData = await sessionRes.json();
        const currentUser = sessionData?.user ?? sessionData;

        if (!cancelled && currentUser?.id != null) {
          const resolvedUser = {
            ...currentUser,
            id: String(currentUser.id),
          };
          setUser(resolvedUser);

          const ordersRes = await fetch("/api/orders", {
            cache: "no-store",
          });

          if (ordersRes.ok) {
            const ordersData = await ordersRes.json();
            if (!cancelled) {
              setServerOrders(
                Array.isArray(ordersData.orders) ? ordersData.orders : EMPTY_ORDERS
              );
            }
          }
        }
      } catch (err) {
        if (!cancelled) {
          setFetchError(err.message || "Failed to load your orders.");
        }
      } finally {
        if (!cancelled) setSessionLoaded(true);
      }
    }

    loadData();
    return () => { cancelled = true; };
  }, []);

  const allOrders = [...serverOrders, ...clientOrders].reduce(
    (acc, order) => {
      if (!acc.some((o) => o.id === order.id)) acc.push(order);
      return acc;
    },
    []
  );

  const sortedOrders = [...allOrders].sort(
    (a, b) => new Date(b.createdAt ?? 0) - new Date(a.createdAt ?? 0)
  );

  if (!sessionLoaded) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#111315] text-white">
        <p>Loading your orders...</p>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-[#111315] p-6 text-center text-white">
        <h1 className="text-2xl font-bold">Please sign in</h1>
        <p className="mt-2 text-gray-400">
          Sign in to view your orders.
        </p>

        <Link
          href="/signin?next=%2Forders"
          className="mt-5 rounded-lg bg-green-600 px-6 py-3 font-semibold text-white"
        >
          Sign In
        </Link>
      </main>
    );
  }

  if (fetchError) {
    return (
      <main className="min-h-screen bg-[#111315] p-8 text-white">
        <p className="text-red-400">{fetchError}</p>
      </main>
    );
  }

  if (sortedOrders.length === 0) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-[#111315] p-6 text-white text-center">
        <h1 className="text-2xl font-bold">No orders yet</h1>
        <p className="mt-2 text-gray-400">
          Your orders will appear here after checkout.
        </p>

        <Link
          href="/menu"
          className="mt-5 rounded-lg bg-green-600 px-6 py-3 font-semibold text-white"
        >
          Browse Menu
        </Link>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#111315] px-4 py-10 text-white">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="mb-2 text-3xl font-bold">
              {user.role === "admin" ? "All Customer Orders" : "My Orders"}
            </h1>
            <p className="mb-8 text-gray-400">
              Welcome back, {user.username}. {user.role === "admin" ? "Here are all customer orders." : "Here are your orders."}
            </p>
          </div>
          <button
            type="button"
            onClick={() => downloadCsv("addis-eats-order-history.csv", toCsv(sortedOrders.map((order) => ({
              orderId: order.id,
              status: order.status || "Pending",
              total: etb(order.total),
              deliveryAddress: order.deliveryAddress || "",
              placedAt: order.createdAt ? when(order.createdAt) : "",
            }))))}
            className="rounded-lg border border-green-700 px-4 py-2 text-sm font-semibold text-green-300 transition hover:bg-green-950"
          >
            Export order history CSV
          </button>
        </div>

        <div className="space-y-4">
          {sortedOrders.map((order) => (
            <article
              key={order.id}
              className="rounded-xl border border-[#292d31] bg-[#1b1e21] p-5 shadow-sm"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="font-bold text-white">
                  Order #{shortOrderId(order.id)}
                </h2>

                <span
                  className={`rounded-full px-3 py-1 text-sm font-medium capitalize ${
                    STATUS_COLORS[order.status] ?? "bg-gray-700/40 text-gray-300"
                  }`}
                >
                  {order.status || "Pending"}
                </span>
              </div>

              <Link
                href={`/track/${encodeURIComponent(order.id)}`}
                className="mt-3 inline-flex text-sm font-semibold text-green-400 hover:text-green-300"
              >
                Track delivery →
              </Link>

              {order.items && order.items.length > 0 && (
                <ul className="mt-3 space-y-1">
                  {order.items.map((item) => (
                    <li key={item.id} className="text-sm text-gray-400">
                      {item.name} × {item.quantity}
                    </li>
                  ))}
                </ul>
              )}

              <p className="mt-3 text-gray-300">
                Total:{" "}
                <span className="font-semibold text-white">
                  {etb(order.total)}
                </span>
              </p>

              {order.deliveryAddress && (
                <p className="mt-1 text-sm text-gray-500">
                  Deliver to: {order.deliveryAddress}
                </p>
              )}

              {order.createdAt && (
                <p className="mt-1 text-xs text-gray-600">
                  Placed on{" "}
                  {when(order.createdAt)}
                </p>
              )}
            </article>
          ))}
        </div>
      </div>
    </main>
  );
}
