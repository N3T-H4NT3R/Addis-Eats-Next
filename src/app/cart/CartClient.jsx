
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useCartStore } from "../store/cartStore";

const EMPTY_CART = [];

export default function CartPage() {
  const [userId, setUserId] = useState(null);
  const [sessionLoaded, setSessionLoaded] = useState(false);
  const [sessionError, setSessionError] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadSession() {
      try {
        const response = await fetch("/api/session", {
          cache: "no-store",
        });

        if (response.status === 401) {
          if (!cancelled) {
            setUserId(null);
          }
          return;
        }

        if (!response.ok) {
          throw new Error("Unable to load session.");
        }

        const data = await response.json();
        const user = data?.user ?? data;
        const id = user?.id;

        if (!cancelled) {
          setUserId(id != null ? String(id) : null);
        }
      } catch (error) {
        console.error("Failed to load session:", error);

        if (!cancelled) {
          setSessionError(true);
        }
      } finally {
        if (!cancelled) {
          setSessionLoaded(true);
        }
      }
    }

    loadSession();

    return () => {
      cancelled = true;
    };
  }, []);

  const cart = useCartStore((state) =>
    userId
      ? state.cartsByUser?.[String(userId)] ?? EMPTY_CART
      : EMPTY_CART
  );

  const updateQuantity = useCartStore(
    (state) => state.updateQuantity
  );

  const removeFromCart = useCartStore(
    (state) => state.removeFromCart
  );

  if (!sessionLoaded) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#111315] text-white">
        Loading your cart...
      </main>
    );
  }

  if (sessionError) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-[#111315] px-4 text-center text-white">
        <h1 className="text-2xl font-bold">
          Unable to load your session
        </h1>
        <p className="mt-3 text-gray-400">
          Please try again or sign in again.
        </p>
        <Link
          href="/signin?next=%2Fcart"
          className="mt-6 rounded-full bg-green-800 px-6 py-3 font-semibold"
        >
          Sign In
        </Link>
      </main>
    );
  }

  if (!userId) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-[#111315] px-4 text-center text-white">
        <h1 className="text-3xl font-bold">Please sign in</h1>
        <p className="mt-3 text-gray-400">
          Sign in to view your shopping cart.
        </p>
        <Link
          href="/signin?next=%2Fcart"
          className="mt-6 rounded-full bg-green-800 px-7 py-3 font-semibold hover:bg-green-700"
        >
          Sign In
        </Link>
      </main>
    );
  }

  const total = cart.reduce(
    (sum, item) =>
      sum +
      Number(item.price || 0) * Number(item.quantity || 1),
    0
  );

  const itemCount = cart.reduce(
    (sum, item) => sum + Number(item.quantity || 1),
    0
  );

  if (cart.length === 0) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-[#111315] px-4 text-center text-white">
        <h1 className="text-3xl font-bold">Your cart is empty</h1>
        <p className="mt-3 text-gray-400">
          Browse our menu and add something delicious.
        </p>
        <Link
          href="/menu"
          className="mt-6 rounded-full bg-green-800 px-7 py-3 font-semibold hover:bg-green-700"
        >
          Browse Menu
        </Link>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#111315] px-4 py-10 text-white">
      <div className="mx-auto max-w-4xl">
        <h1 className="text-3xl font-bold">Your Cart</h1>

        <p className="mt-2 text-gray-400">
          {itemCount} item(s) in your cart
        </p>

        <div className="mt-8 space-y-4">
          {cart.map((item) => (
            <article
              key={item.id}
              className="flex flex-wrap items-center justify-between gap-4 rounded-xl bg-[#1d2023] p-5"
            >
              <div>
                <h2 className="font-semibold">{item.name}</h2>
                <p className="mt-1 text-gray-400">
                  ETB {Number(item.price || 0).toFixed(2)}
                </p>
                <p className="mt-1 text-sm text-gray-500">
                  Subtotal: ETB{" "}
                  {(
                    Number(item.price || 0) *
                    Number(item.quantity || 1)
                  ).toFixed(2)}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  aria-label={`Decrease quantity of ${item.name}`}
                  onClick={() =>
                    updateQuantity(
                      userId,
                      item.id,
                      Number(item.quantity || 1) - 1
                    )
                  }
                  className="rounded bg-gray-700 px-3 py-1"
                >
                  −
                </button>

                <span>{Number(item.quantity || 1)}</span>

                <button
                  type="button"
                  aria-label={`Increase quantity of ${item.name}`}
                  onClick={() =>
                    updateQuantity(
                      userId,
                      item.id,
                      Number(item.quantity || 1) + 1
                    )
                  }
                  className="rounded bg-gray-700 px-3 py-1"
                >
                  +
                </button>

                <button
                  type="button"
                  onClick={() => removeFromCart(userId, item.id)}
                  aria-label={`Remove ${item.name} from cart`}
                  className="ml-2 text-red-400 hover:text-red-300"
                >
                  Remove
                </button>
              </div>
            </article>
          ))}
        </div>

        <section className="mt-8 rounded-xl bg-[#1d2023] p-6">
          <div className="flex items-center justify-between">
            <span className="text-lg text-gray-300">Total</span>
            <span className="text-2xl font-bold">
              ETB {total.toFixed(2)}
            </span>
          </div>

          <Link
            href="/checkout"
            className="mt-6 block rounded-full bg-green-800 px-7 py-3 text-center font-semibold hover:bg-green-700"
          >
            Proceed to Checkout
          </Link>

          <Link
            href="/menu"
            className="mt-4 block text-center text-gray-400 hover:text-white"
          >
            Continue Shopping
          </Link>
        </section>
      </div>
    </main>
  );
}