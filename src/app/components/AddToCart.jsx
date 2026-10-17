"use client";

import { useRouter, usePathname } from "next/navigation";
import useSWR from "swr";
import { useCartStore } from "../store/cartStore";

const sessionFetcher = (url) =>
  fetch(url, { cache: "no-store" }).then((r) => (r.ok ? r.json() : null));

export function AddToCart({ dish, userId: userIdProp = undefined }) {
  const router   = useRouter();
  const pathname = usePathname();
  const addToCart = useCartStore((state) => state.addToCart);

  const { data: sessionData } = useSWR(
    userIdProp !== undefined ? null : "/api/session",
    sessionFetcher,
    { revalidateOnFocus: true }
  );

  const userId =
    userIdProp !== undefined
      ? userIdProp
      : sessionData
        ? String((sessionData.user ?? sessionData).id)
        : null;

  function handleAddToCart() {
    if (userId == null) {
      router.push(`/signin?next=${encodeURIComponent(pathname)}`);
      return;
    }

    if (!dish || dish.id == null) {
      console.error("AddToCart: invalid dish", dish);
      return;
    }

    addToCart(userId, { ...dish, quantity: 1 });
  }

  return (
    <button
      type="button"
      onClick={handleAddToCart}
      className="w-full rounded-lg bg-green-700 px-4 py-2 font-semibold text-white transition hover:bg-green-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-500"
    >
      Add to Cart
    </button>
  );
}
