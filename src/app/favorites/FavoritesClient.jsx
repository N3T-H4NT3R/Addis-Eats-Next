"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useFavoriteStore } from "../store/favoriteStore";

const EMPTY_FAVORITES = [];

export default function FavoritesPage() {
  const [userId, setUserId] = useState(null);
  const [sessionLoaded, setSessionLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadSession() {
      try {
        const res = await fetch("/api/session", { cache: "no-store" });
        if (res.ok) {
          const data = await res.json();
          const id = (data?.user ?? data)?.id;
          if (!cancelled && id != null) {
            setUserId(String(id));
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

  const favorites = useFavoriteStore((state) => {
    if (!userId) return EMPTY_FAVORITES;
    const userFavorites = state.favoritesByUser[userId];
    return Array.isArray(userFavorites) ? userFavorites : EMPTY_FAVORITES;
  });

  const removeFavorite = useFavoriteStore((state) => state.removeFavorite);
  const clearFavorites = useFavoriteStore((state) => state.clearFavorites);

  if (!sessionLoaded) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#111315] text-white">
        Loading your favorites...
      </main>
    );
  }

  if (!userId) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-[#111315] px-4 text-center text-white">
        <h1 className="text-2xl font-bold">Please sign in</h1>
        <p className="mt-2 text-gray-400">
          Sign in to view your favorite dishes.
        </p>
        <Link
          href="/signin?next=%2Ffavorites"
          className="mt-5 rounded-full bg-green-600 px-6 py-3 font-semibold text-white"
        >
          Sign In
        </Link>
      </main>
    );
  }

  if (favorites.length === 0) {
    return (
      <main className="min-h-screen bg-[#111315] px-4 py-12">
        <div className="mx-auto max-w-5xl">
          <div className="rounded-2xl bg-[#1b1e21] px-6 py-16 text-center">
            <h1 className="mb-3 text-3xl font-bold text-white">
              Your Favorites
            </h1>

            <p className="mb-8 text-gray-400">
              You haven&apos;t added any favorite dishes yet.
            </p>

            <Link
              href="/menu"
              className="inline-block rounded-lg bg-green-500 px-6 py-3 font-semibold text-white transition hover:bg-green-600"
            >
              Explore Our Menu
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#111315] px-4 py-10">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white">
              My Favorites
            </h1>

            <p className="mt-2 text-gray-400">
              Your favorite dishes in one place.
            </p>
          </div>

          <button
            type="button"
            onClick={() => clearFavorites(userId)}
            className="rounded-lg border border-red-800 bg-[#1b1e21] px-4 py-2 font-medium text-red-400 transition hover:bg-red-950/40"
          >
            Clear All
          </button>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {favorites.map((dish) => (
            <article
              key={dish.id}
              className="overflow-hidden rounded-2xl bg-[#1b1e21] shadow-sm transition hover:-translate-y-1 hover:shadow-md"
            >
              <div className="relative h-56 w-full bg-[#292d31]">
                {dish.image ? (
                  <Image
                    src={dish.image}
                    alt={dish.name || "Favorite dish"}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-gray-500">
                    No image available
                  </div>
                )}
              </div>

              <div className="p-5">
                <h2 className="text-xl font-bold text-white">
                  {dish.name}
                </h2>

                {dish.description && (
                  <p className="mt-2 line-clamp-2 text-sm text-gray-400">
                    {dish.description}
                  </p>
                )}

                {dish.price !== undefined && (
                  <p className="mt-3 text-lg font-bold text-green-400">
                    {Number(dish.price).toLocaleString()} ETB
                  </p>
                )}

                <div className="mt-5 flex gap-3">
                  <Link
                    href={`/menu/${dish.id}`}
                    className="flex-1 rounded-lg bg-green-500 px-4 py-3 text-center font-semibold text-white transition hover:bg-green-600"
                  >
                    View Dish
                  </Link>

                  <button
                    type="button"
                    onClick={() => removeFavorite(userId, dish.id)}
                    className="rounded-lg border border-red-800 px-4 py-3 font-semibold text-red-400 transition hover:bg-red-950/40"
                    aria-label={`Remove ${dish.name} from favorites`}
                  >
                    Remove
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </main>
  );
}
