import { Suspense } from "react";
import Script from "next/script";

import { Dishes } from "@/app/lib/Dishes";
import DishList from "./DishList";
import DishListSkeleton from "./DishListSkeleton";

export const metadata = {
  title: "Menu",
  description:
    "Browse the full Addis Eats menu — Ethiopian food, pizza, burgers and refreshing drinks. Filter by category and search for your favourites.",
  openGraph: {
    title: "Menu | Addis Eats",
    description:
      "Browse Ethiopian food, pizza, burgers and drinks. Order online with fast delivery in Addis Ababa.",
    url: "/menu",
  },
  twitter: {
    card: "summary_large_image",
    title: "Menu | Addis Eats",
    description:
      "Browse Ethiopian food, pizza, burgers and drinks. Order online with fast delivery in Addis Ababa.",
  },
};

const menuJsonLd = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  name: "Addis Eats Menu",
  description: "Full menu of dishes available at Addis Eats.",
  itemListElement: Dishes.map((dish, index) => ({
    "@type": "ListItem",
    position: index + 1,
    item: {
      "@type": "MenuItem",
      name: dish.name,
      description: dish.description,
      image: dish.image,
      offers: {
        "@type": "Offer",
        price: String(dish.price),
        priceCurrency: "ETB",
      },
    },
  })),
};

export default function MenuPage() {
  return (
    <div className="min-w-0 mb-16">
      <Script
        id="jsonld-menu"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(menuJsonLd) }}
      />

      <div className="mb-6 sm:mb-8">
        <h1 className="mt-2 text-2xl font-extrabold leading-tight text-white sm:text-3xl lg:text-4xl">
          Choose your favorite food
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-gray-400 sm:text-base">
          Explore delicious meals from Addis Eats.
        </p>
      </div>

      <Suspense fallback={<DishListSkeleton />}>
        <DishList />
      </Suspense>
    </div>
  );
}
