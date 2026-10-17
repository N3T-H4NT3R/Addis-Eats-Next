import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import Script from "next/script";
import { ArrowLeft } from "lucide-react";

import { Dishes } from "@/app/lib/Dishes";
import { AddToCart } from "@/app/components/AddToCart";

export function generateStaticParams() {
  return Dishes.map((dish) => ({ id: String(dish.id) }));
}

export async function generateMetadata({ params }) {
  const { id } = await params;
  const dish = Dishes.find((d) => String(d.id) === id);

  if (!dish) return { title: "Dish Not Found" };

  return {
    title: dish.name,
    description: `${dish.description} Order ${dish.name} from Addis Eats for ETB ${dish.price}.`,
    openGraph: {
      title: `${dish.name} | Addis Eats`,
      description: `${dish.description} — ETB ${dish.price}`,
      images: [{ url: dish.image, width: 800, height: 600, alt: dish.name }],
      url: `/menu/${dish.id}`,
    },
    twitter: {
      card: "summary_large_image",
      title: `${dish.name} | Addis Eats`,
      description: `${dish.description} — ETB ${dish.price}`,
      images: [dish.image],
    },
  };
}

export default async function DishPage({ params }) {
  const { id } = await params;
  const dish = Dishes.find((d) => String(d.id) === id);

  if (!dish) notFound();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "MenuItem",
    name: dish.name,
    description: dish.description,
    image: dish.image,
    offers: {
      "@type": "Offer",
      price: String(dish.price),
      priceCurrency: "ETB",
      availability: "https://schema.org/InStock",
    },
    menuAddOn: {
      "@type": "FoodEstablishment",
      name: "Addis Eats",
    },
  };

  return (
    <main className="min-h-screen bg-[#111315]">
      <Script
        id={`jsonld-dish-${dish.id}`}
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12">
        <Link
          href="/menu"
          className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-gray-400 transition hover:text-orange-400 sm:mb-8"
        >
          <ArrowLeft size={18} aria-hidden="true" />
          Back to Menu
        </Link>

        <div className="grid overflow-hidden rounded-3xl border border-[#292d31] bg-[#1b1e21] shadow-xl md:grid-cols-2">
          <div className="relative h-64 sm:h-96 md:h-full md:min-h-[500px]">
            <Image
              src={dish.image}
              alt={dish.name}
              fill
              priority
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover"
            />
          </div>

          <div className="flex flex-col justify-center p-5 sm:p-8 md:p-12">
            <span className="w-fit rounded-full border border-orange-500/20 bg-orange-500/10 px-4 py-2 text-sm font-semibold text-orange-400">
              {dish.category}
            </span>

            <h1 className="mt-5 text-3xl font-extrabold text-white sm:text-4xl md:text-5xl">
              {dish.name}
            </h1>

            <p className="mt-5 text-base leading-7 text-gray-400 sm:mt-6 sm:text-lg sm:leading-8">
              {dish.description}
            </p>

            <div className="mt-7 border-t border-[#292d31] pt-6 sm:mt-8">
              <p className="text-sm font-medium text-gray-500">Price</p>
              <p className="mt-1 text-3xl font-extrabold text-orange-400">
                {dish.price} ETB
              </p>
            </div>

            <div className="mt-7 sm:mt-8">
              <AddToCart dish={dish} />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
