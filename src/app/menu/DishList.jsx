"use client";

import { useEffect, useMemo, useState, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import useSWR from "swr";

import { useFavoriteStore } from "../store/favoriteStore";
import { AddToCart } from "../components/AddToCart";
import DishListSkeleton from "./DishListSkeleton";

const EMPTY_ARRAY = [];

const fetcher = (url) =>
  fetch(url).then((res) => {
    if (!res.ok) throw new Error("Failed to load dishes");
    return res.json();
  });

function DishGrid() {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const category     = searchParams.get("category") || "All";
  const search       = searchParams.get("search")   || "";

  const filterKey = JSON.stringify([category, search]);
  const [pagination, setPagination] = useState({ filterKey, page: 1 });
  const page = pagination.filterKey === filterKey ? pagination.page : 1;
  const PAGE_SIZE = 9;

  const { data: sessionData } = useSWR(
    "/api/session",
    (url) => fetch(url, { cache: "no-store" }).then((r) => (r.ok ? r.json() : null)),
    { revalidateOnFocus: true }
  );
  const userId = sessionData
    ? String((sessionData.user ?? sessionData).id)
    : null;

  const { data, error, isLoading } = useSWR("/api/dishes", fetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
  });

  const dishes = Array.isArray(data)
    ? data
    : Array.isArray(data?.dishes)
      ? data.dishes
      : EMPTY_ARRAY;

  const favorites = useFavoriteStore((state) => {
    if (!userId) return EMPTY_ARRAY;
    const list = state.favoritesByUser?.[userId];
    return Array.isArray(list) ? list : EMPTY_ARRAY;
  });

  const toggleFavorite = useFavoriteStore((state) => state.toggleFavorite);

  function handleFavorite(dish) {
    if (!userId) {
      router.push("/signin?next=/menu");
      return;
    }
    toggleFavorite(userId, dish);
  }

  const filteredDishes = useMemo(() => {
    const q = search.trim().toLowerCase();
    return dishes.filter((dish) => {
      const matchesCategory =
        !category || category === "All" ||
        dish.category?.toLowerCase() === category.toLowerCase();
      const matchesSearch =
        !q ||
        dish.name?.toLowerCase().includes(q) ||
        dish.description?.toLowerCase().includes(q);
      return matchesCategory && matchesSearch;
    });
  }, [dishes, category, search]);

  const totalPages  = Math.max(1, Math.ceil(filteredDishes.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paginatedDishes = filteredDishes.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  if (isLoading) return <DishListSkeleton />;

  if (error) {
    return (
      <p className="py-10 text-center text-red-400">
        Failed to load dishes. Please try again.
      </p>
    );
  }

  if (filteredDishes.length === 0) {
    return (
      <p className="py-10 text-center text-gray-400">No dishes found.</p>
    );
  }

  return (
    <section aria-label="Dish listings">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {paginatedDishes.map((dish) => {
          const isFavorite = favorites.some(
            (fav) => String(fav.id) === String(dish.id)
          );

          return (
            <article
              key={dish.id}
              className="overflow-hidden rounded-xl border border-[#292d31] bg-[#1b1e21] shadow-md transition hover:border-[#35393e] hover:shadow-lg"
            >
              <Link
                href={`/menu/${dish.id}`}
                aria-label={`View ${dish.name}`}
                className="block"
              >
                <div className="relative h-48 w-full bg-[#292d31] sm:h-52">
                  {dish.image && (
                    <Image
                      src={dish.image}
                      alt={dish.name}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-cover"
                    />
                  )}
                </div>
              </Link>

              <div className="space-y-3 p-4">
                <div className="flex items-start justify-between gap-3">
                  <Link
                    href={`/menu/${dish.id}`}
                    className="font-bold text-white hover:text-green-400"
                  >
                    {dish.name}
                  </Link>

                  <button
                    type="button"
                    onClick={() => handleFavorite(dish)}
                    aria-label={
                      isFavorite
                        ? `Remove ${dish.name} from favorites`
                        : `Add ${dish.name} to favorites`
                    }
                    aria-pressed={isFavorite}
                    className="text-xl text-red-400 transition hover:text-red-300"
                  >
                    {isFavorite ? "♥" : "♡"}
                  </button>
                </div>

                <p className="line-clamp-2 text-sm text-gray-400">
                  {dish.description}
                </p>

                <p className="font-semibold text-green-400">
                  {Number(dish.price ?? 0).toLocaleString()} ETB
                </p>

                <AddToCart dish={dish} userId={userId} />
              </div>
            </article>
          );
        })}
      </div>

      {totalPages > 1 && (
        <nav
          aria-label="Dish pagination"
          className="mt-8 flex items-center justify-center gap-4"
        >
          <button
            type="button"
            disabled={currentPage === 1}
            onClick={() => setPagination({ filterKey, page: currentPage - 1 })}
            className="rounded-lg bg-[#1b1e21] px-4 py-2 text-white hover:bg-[#292d31] disabled:opacity-50"
          >
            Previous
          </button>

          <span className="text-sm text-gray-400" aria-live="polite">
            Page {currentPage} of {totalPages}
          </span>

          <button
            type="button"
            disabled={currentPage === totalPages}
            onClick={() => setPagination({ filterKey, page: currentPage + 1 })}
            className="rounded-lg bg-[#1b1e21] px-4 py-2 text-white hover:bg-[#292d31] disabled:opacity-50"
          >
            Next
          </button>
        </nav>
      )}
    </section>
  );
}

export default function DishList() {
  return (
    <Suspense fallback={<DishListSkeleton />}>
      <DishGrid />
    </Suspense>
  );
}
