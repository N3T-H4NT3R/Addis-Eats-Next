"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { etb, relative, shortOrderId, when } from "@/app/lib/format";
import { useOrderStore } from "@/app/store/orderStore";

const DeliveryMap = dynamic(() => import("./DeliveryMap"), {
  ssr: false,
  loading: () => (
    <div
      className="h-[380px] animate-pulse rounded-2xl bg-[#24292d] sm:h-[460px]"
      aria-label="Loading delivery map"
      role="status"
    />
  ),
});

const ADDRESS_COORDINATES = {
  Bole: [8.995, 38.788],
  Kazanchis: [9.016, 38.762],
  Piassa: [9.035, 38.746],
};

const STATUS_LABELS = {
  confirmed: "Order confirmed",
  preparing: "Being prepared",
  ready: "Ready for pickup",
  delivering: "Courier is delivering",
  delivered: "Delivered",
};

export default function TrackClient({ orderId }) {
  const [order, setOrder] = useState(null);
  const [status, setStatus] = useState(null);
  const [updatedAt, setUpdatedAt] = useState(null);
  const [courierLocation, setCourierLocation] = useState(null);
  const [connection, setConnection] = useState("connecting");
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadOrder() {
      try {
        const response = await fetch("/api/orders", { cache: "no-store" });
        if (!response.ok) throw new Error("Unable to load this order.");
        const data = await response.json();
        let found = data.orders?.find((item) => String(item.id) === String(orderId));

        if (!found) {
          const sessionResponse = await fetch("/api/session", { cache: "no-store" });
          if (sessionResponse.ok) {
            const sessionData = await sessionResponse.json();
            const currentUser = sessionData?.user ?? sessionData;
            const localOrder = useOrderStore
              .getState()
              .ordersByUser?.[String(currentUser?.id)]
              ?.find((item) => String(item.id) === String(orderId));

            if (localOrder) {
              const syncResponse = await fetch("/api/orders", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(localOrder),
              });
              if (syncResponse.ok) {
                const syncData = await syncResponse.json();
                found = syncData.order;
              }
            }
          }
        }

        if (!found) throw new Error("This order could not be found.");
        if (!cancelled) {
          setOrder(found);
          setStatus(found.status || "confirmed");
        }
      } catch (loadError) {
        if (!cancelled) setError(loadError.message || "Unable to load this order.");
      }
    }

    loadOrder();
    return () => {
      cancelled = true;
    };
  }, [orderId]);

  useEffect(() => {
    if (!order) {
      return undefined;
    }

    const source = new EventSource(`/api/orders/${encodeURIComponent(orderId)}/stream`);

    source.onopen = () => setConnection("connected");
    source.addEventListener("status", (event) => {
      try {
        const update = JSON.parse(event.data);
        setStatus(update.status);
        if (update.status !== "delivering") setCourierLocation(null);
        setUpdatedAt(update.updatedAt);
        if (update.status === "delivered") {
          setConnection("complete");
          source.close();
        }
      } catch {
        setConnection("reconnecting");
      }
    });
    source.addEventListener("location", (event) => {
      try {
        const update = JSON.parse(event.data);
        setCourierLocation([update.latitude, update.longitude]);
        setUpdatedAt(update.updatedAt);
      } catch {
        setConnection("reconnecting");
      }
    });
    source.onerror = () => {
      setConnection((current) => current === "complete" ? current : "reconnecting");
    };

    return () => source.close();
  }, [order, orderId]);

  const mapLocations = useMemo(() => {
    if (!order) return null;
    const neighborhood = Object.keys(ADDRESS_COORDINATES).find((name) =>
      order.deliveryAddress?.includes(name)
    );
    const delivery = ADDRESS_COORDINATES[neighborhood] || [9.012, 38.761];
    const routeStart = [delivery[0] - 0.008, delivery[1] - 0.009];
    return { routeStart, delivery };
  }, [order]);

  if (error) {
    return (
      <main className="mx-auto min-h-[70vh] max-w-4xl px-4 py-16 text-white">
        <h1 className="text-2xl font-bold">Unable to track order</h1>
        <p className="mt-3 text-gray-400">{error}</p>
        <Link className="mt-6 inline-block text-green-400 underline" href="/orders">
          Return to orders
        </Link>
      </main>
    );
  }

  if (!order || !mapLocations) {
    return (
      <main className="mx-auto flex min-h-[70vh] max-w-4xl items-center px-4 text-gray-300">
        <p role="status">Loading delivery details…</p>
      </main>
    );
  }

  const statusLabel = STATUS_LABELS[status] || status || "Status pending";
  const effectiveConnection = status === "delivered" ? "complete" : connection;
  const connectionLabel = {
    connecting: "Connecting to live updates",
    connected: "Live updates connected",
    reconnecting: "Reconnecting to live updates",
    complete: "Delivery complete",
  }[effectiveConnection];

  return (
    <main className="min-h-screen bg-[#111315] px-4 py-10 text-white sm:px-6">
      <div className="mx-auto max-w-6xl">
        <Link href="/orders" className="text-sm font-medium text-green-400 hover:text-green-300">
          ← Back to orders
        </Link>
        <div className="mt-6 flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-green-400">
              Addis Eats delivery
            </p>
            <h1 className="mt-2 text-3xl font-bold sm:text-4xl">Track order #{shortOrderId(order.id)}</h1>
          </div>
          <div className="rounded-xl border border-[#30363a] bg-[#1b1e21] px-4 py-3">
            <p className="text-sm text-gray-400">Current status</p>
            <p className="mt-1 font-semibold text-white" aria-live="polite">{statusLabel}</p>
          </div>
        </div>

        <div className="mt-5 flex items-center gap-2 text-sm text-gray-400" role="status">
          <span
            className={`h-2.5 w-2.5 rounded-full ${effectiveConnection === "connected" ? "bg-green-400" : effectiveConnection === "complete" ? "bg-blue-400" : "bg-amber-400 animate-pulse"}`}
            aria-hidden="true"
          />
          {connectionLabel}
        </div>

        <section className="mt-7 grid gap-5 lg:grid-cols-[minmax(0,1.7fr)_minmax(280px,0.8fr)]">
          <div className="overflow-hidden rounded-2xl border border-[#292d31] bg-[#1b1e21] p-2">
            <DeliveryMap
              routeStart={mapLocations.routeStart}
              courier={courierLocation || (status === "delivered" ? mapLocations.delivery : mapLocations.routeStart)}
              delivery={mapLocations.delivery}
              deliveryAddress={order.deliveryAddress || "Delivery address unavailable"}
              isDelivering={status === "delivering"}
            />
          </div>

          <aside className="rounded-2xl border border-[#292d31] bg-[#1b1e21] p-5 sm:p-6" aria-label="Delivery details">
            <h2 className="text-xl font-bold">Delivery details</h2>
            <dl className="mt-5 space-y-5">
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wider text-gray-500">Courier</dt>
                <dd className="mt-1 text-gray-100">Your Addis Eats courier</dd>
                <dd className="mt-1 text-sm text-gray-400">{status === "delivering" ? "Courier location updates live on the map" : `Near ${order.deliveryAddress || "your delivery address"}`}</dd>
                {status === "delivering" && <dd className="mt-1 text-xs text-amber-300">Demo route preview · live GPS requires a courier device</dd>}
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wider text-gray-500">Delivery address</dt>
                <dd className="mt-1 text-gray-100">{order.deliveryAddress || "Address unavailable"}</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wider text-gray-500">Order total</dt>
                <dd className="mt-1 font-semibold text-gray-100">{etb(order.total)}</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wider text-gray-500">Placed</dt>
                <dd className="mt-1 text-gray-100">{when(order.createdAt)}</dd>
                <dd className="mt-1 text-sm text-gray-400">{relative(order.createdAt)}</dd>
              </div>
              {updatedAt && (
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wider text-gray-500">Last status update</dt>
                  <dd className="mt-1 text-gray-100">{when(updatedAt)}</dd>
                  <dd className="mt-1 text-sm text-gray-400">{relative(updatedAt)}</dd>
                </div>
              )}
            </dl>
          </aside>
        </section>
      </div>
    </main>
  );
}