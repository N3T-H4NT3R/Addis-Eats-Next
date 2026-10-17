"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

const categories = [
  "All",
  "Ethiopian",
  "Pizza",
  "Burgers",
  "Drinks",
];

export default function Category() {
  const searchParams = useSearchParams();
  const currentCategory = searchParams.get("category") || "All";

  return (
    <aside className="h-fit min-w-0 rounded-2xl border border-[#292d31] bg-[#111315] p-4 mt-27 shadow-sm sm:p-5 lg:sticky lg:top-28">
      <h2 className="mb-4 text-lg font-bold text-white sm:mb-5">
        Categories
      </h2>

      <nav
        aria-label="Food categories"
        className="flex gap-2 overflow-x-auto pb-1 lg:flex-col lg:overflow-visible lg:pb-0"
      >
        {categories.map((category) => {
          const isActive =
            currentCategory.toLowerCase() === category.toLowerCase();

          const href =
            category === "All"
              ? "/menu"
              : `/menu?category=${encodeURIComponent(category)}`;

          return (
            <Link
              key={category}
              href={href}
              aria-current={isActive ? "page" : undefined}
              className={`shrink-0 whitespace-nowrap rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-400 ${
                isActive
                  ? "bg-green-800 text-white shadow-sm shadow-green-800/20"
                  : "bg-[#1b1e21] text-gray-300 hover:bg-[#292d31] hover:text-green-400"
              }`}
            >
              {category}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}