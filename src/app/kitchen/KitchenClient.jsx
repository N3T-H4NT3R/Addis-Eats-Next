"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { shortOrderId } from "@/app/lib/format";

const STATUS_FLOW = ["confirmed", "preparing", "ready", "delivering", "delivered"];

const STATUS_COLORS = {
  confirmed: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  preparing: "bg-orange-500/10 text-orange-400 border-orange-500/20",
  ready: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  delivering: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  delivered: "bg-green-500/10 text-green-400 border-green-500/20",
};

export default function KitchenPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState(null);

  const loadOrders = useCallback(async () => {
    try {
      const response = await fetch("/api/kitchen/orders", {
        cache: "no-store",
      });

      if (response.status === 401) {
        setError("You must be signed in.");
        return;
      }

      if (response.status === 403) {
        setError("Access denied: staff only.");
        return;
      }

      if (!response.ok) {
        setError("Failed to load orders.");
        return;
      }

      const data = await response.json();
      setOrders(Array.isArray(data.orders) ? data.orders : []);
    } catch {
      setError("Network error. Please refresh.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const initialLoad = setTimeout(loadOrders, 0);
    const interval = setInterval(loadOrders, 15_000);
    return () => {
      clearTimeout(initialLoad);
      clearInterval(interval);
    };
  }, [loadOrders]);

  async function updateStatus(orderId, status) {
    setUpdatingId(orderId);
    try {
      const response = await fetch(`/api/kitchen/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      if (response.status === 401) {
        setError("Session expired. Please sign in again.");
        return;
      }

      if (response.status === 403) {
        setError("Forbidden: only staff can update orders.");
        return;
      }

      if (!response.ok) {
        setError("Failed to update order status.");
        return;
      }

      const data = await response.json();
      setOrders((current) =>
        current.map((order) =>
          order.id === orderId
            ? { ...order, status: data.order.status }
            : order
        )
      );
    } catch {
      setError("Network error while updating.");
    } finally {
      setUpdatingId(null);
    }
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#111315]">
        <p className="text-gray-500">Loading kitchen orders...</p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#111315] p-8 text-center">
        <p className="text-red-400">{error}</p>
        <Link
          href="/signin?next=%2Fkitchen"
          className="rounded-lg bg-green-600 px-5 py-2.5 font-semibold text-white hover:bg-green-500"
        >
          Sign In
        </Link>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#111315]">
      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="mb-8">
          <p className="font-semibold text-green-400">Addis Eats</p>

          <h1 className="mt-2 text-4xl font-extrabold text-white">
            Kitchen
          </h1>

          <p className="mt-3 text-gray-400">
            Manage customer orders and update their status.
            Auto-refreshes every 15 seconds.
          </p>
        </div>

        {orders.length === 0 ? (
          <div className="rounded-3xl border border-[#292d31] bg-[#1b1e21] p-10 text-center shadow-sm">
            <h2 className="text-xl font-bold text-white">
              No orders
            </h2>
            <p className="mt-2 text-gray-400">
              There are no customer orders yet.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div
                key={order.id}
                className="rounded-2xl border border-[#292d31] bg-[#1b1e21] p-6 shadow-sm"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h2 className="text-xl font-bold text-white">
                      {shortOrderId(order.id)}
                    </h2>
                    <p className="mt-1 text-gray-400">
                      Total: {order.total} ETB
                    </p>
                  </div>

                  <span
                    className={`rounded-full border px-4 py-1.5 text-sm font-semibold capitalize ${
                      STATUS_COLORS[order.status] ??
                      "border-gray-200 bg-gray-100 text-gray-600"
                    }`}
                  >
                    {order.status}
                  </span>
                </div>

                <div className="mt-5 flex flex-wrap gap-3">
                  {STATUS_FLOW.map((status) => (
                    <button
                      key={status}
                      disabled={
                        order.status === status || updatingId === order.id
                      }
                      onClick={() => updateStatus(order.id, status)}
                      className={`rounded-lg px-4 py-2 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-40 ${
                        status === "confirmed"
                          ? "bg-blue-500 hover:bg-blue-600"
                          : status === "preparing"
                              ? "bg-orange-500 hover:bg-orange-600"
                            : status === "ready"
                              ? "bg-yellow-500 hover:bg-yellow-600"
                              : status === "delivering"
                                ? "bg-purple-600 hover:bg-purple-700"
                              : "bg-green-700 hover:bg-green-800"
                      }`}
                    >
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
