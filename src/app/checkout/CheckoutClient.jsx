"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useCartStore } from "@/app/store/cartStore";
import { useOrderStore } from "@/app/store/orderStore";

const EMPTY_CART = [];

export default function CheckoutPage() {
  const router = useRouter();

  const [user, setUser] = useState(null);
  const [sessionLoaded, setSessionLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadSession() {
      try {
        const res = await fetch("/api/session", {
          cache: "no-store",
        });

        if (res.ok) {
          const data = await res.json();
          const currentUser = data?.user ?? data;
          if (!cancelled && currentUser?.id != null) {
            setUser({
              ...currentUser,
              id: String(currentUser.id),
            });
          }
        }
      } catch {
      } finally {
        if (!cancelled) setSessionLoaded(true);
      }
    }

    loadSession();
    return () => { cancelled = true; };
  }, []);

  const cart = useCartStore((state) =>
    user
      ? state.cartsByUser?.[String(user.id)] ?? EMPTY_CART
      : EMPTY_CART
  );

  const clearCart = useCartStore((state) => state.clearCart);
  const addOrder = useOrderStore((state) => state.addOrder);

  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const submissionStarted = useRef(false);
  const orderId = useRef(null);

  const total = cart.reduce(
    (sum, item) =>
      sum + Number(item.price) * Number(item.quantity ?? 1),
    0
  );

  async function handleCheckout(event) {
    event.preventDefault();
    if (submissionStarted.current) return;
    setError("");

    if (!user) {
      setError("You must be signed in to place an order.");
      return;
    }

    if (cart.length === 0) {
      setError("Your cart is empty.");
      return;
    }

    if (address.trim().length < 5) {
      setError("Please enter a valid delivery address.");
      return;
    }

    if (phone.trim().length < 7) {
      setError("Please enter a valid contact phone number.");
      return;
    }

    submissionStarted.current = true;
    setSubmitting(true);
    orderId.current ??= `ORD-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;

    const order = {
      id: orderId.current,
      userId: user.id,
      items: cart.map((item) => ({
        id: item.id,
        name: item.name,
        price: Number(item.price),
        quantity: Number(item.quantity ?? 1),
      })),
      deliveryAddress: address.trim(),
      phone: phone.trim(),
      status: "confirmed",
      total,
      createdAt: new Date().toISOString(),
    };

    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(order),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to place the order.");
      }

      addOrder(user.id, data.order);
      clearCart(user.id);
      orderId.current = null;
      router.push(`/track/${encodeURIComponent(data.order.id)}`);
    } catch (submitError) {
      submissionStarted.current = false;
      setSubmitting(false);
      setError(submitError.message || "Unable to place the order. Please try again.");
    }
  }

  if (!sessionLoaded) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#111315] text-white">
        Loading...
      </main>
    );
  }

  if (cart.length === 0) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#111315] px-4 text-white">
        <div className="text-center">
          <h1 className="text-2xl font-bold">
            Your cart is empty
          </h1>

          <Link
            href="/menu"
            className="mt-5 inline-block rounded-full bg-green-500 px-6 py-3 font-semibold hover:bg-green-600"
          >
            Browse Menu
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#111315] px-4 py-10 text-white">
      <div className="mx-auto max-w-2xl">
        <h1 className="text-3xl font-extrabold">Checkout</h1>

        <p className="mt-2 text-gray-400">
          Confirm your order and delivery address.
        </p>

        <form
          onSubmit={handleCheckout}
          className="mt-8 space-y-6 rounded-2xl border border-[#292d31] bg-[#1b1e21] p-6 sm:p-8"
        >
          <div>
            <h2 className="text-xl font-bold">Order Summary</h2>

            <div className="mt-4 space-y-4">
              {cart.map((item) => (
                <div
                  key={item.id}
                  className="flex justify-between gap-4"
                >
                  <span className="text-gray-300">
                    {item.name} × {item.quantity ?? 1}
                  </span>

                  <span className="shrink-0">
                    ETB{" "}
                    {(
                      Number(item.price) * Number(item.quantity ?? 1)
                    ).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-6 border-t border-[#292d31] pt-4">
              <div className="flex justify-between text-lg font-bold">
                <span>Total</span>
                <span>ETB {total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div>
            <label
              htmlFor="address"
              className="mb-2 block font-semibold"
            >
              Delivery Address
            </label>

            <input
              id="address"
              name="address"
              type="text"
              autoComplete="street-address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="e.g. Bole, Addis Ababa"
              className="w-full rounded-xl border border-[#35393e] bg-[#111315] px-4 py-3 text-sm text-white outline-none placeholder:text-gray-600 focus:border-green-500 focus:ring-2 focus:ring-green-500/20"
              required
              minLength={5}
            />
          </div>

          <div>
            <label
              htmlFor="phone"
              className="mb-2 block font-semibold"
            >
              Contact Phone
            </label>

            <input
              id="phone"
              name="phone"
              type="tel"
              autoComplete="tel"
              inputMode="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="e.g. +251 912 345 678"
              className="w-full rounded-xl border border-[#35393e] bg-[#111315] px-4 py-3 text-sm text-white outline-none placeholder:text-gray-600 focus:border-green-500 focus:ring-2 focus:ring-green-500/20"
              required
              minLength={7}
              maxLength={20}
            />
          </div>

          {error && (
            <p role="alert" className="text-sm text-red-400">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            aria-busy={submitting}
            className="w-full rounded-xl bg-green-600 py-3.5 font-bold text-white transition hover:bg-green-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? "Placing Order..." : "Place Order"}
          </button>
        </form>
      </div>
    </main>
  );
}
