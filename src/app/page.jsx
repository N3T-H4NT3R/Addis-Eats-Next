import Link from "next/link";
import Image from "next/image";
import Script from "next/script";

export const metadata = {
  title: "Addis Eats — Order Delicious Food in Addis Ababa",
  description:
    "Discover Ethiopian meals, burgers, pizza and drinks. Order your favourite food online with fast delivery in Addis Ababa.",
  openGraph: {
    title: "Addis Eats — Order Delicious Food in Addis Ababa",
    description:
      "Discover Ethiopian meals, burgers, pizza and drinks. Order your favourite food online with fast delivery in Addis Ababa.",
    url: "/",
  },
};

const restaurantJsonLd = {
  "@context": "https://schema.org",
  "@type": "Restaurant",
  name: "Addis Eats",
  description:
    "Order delicious Ethiopian food, pizza, burgers and drinks with fast delivery in Addis Ababa.",
  url:
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://addis-eats.vercel.app",
  image: "/images/hero-food.png",
  servesCuisine: ["Ethiopian", "Pizza", "Burgers"],
  address: {
    "@type": "PostalAddress",
    addressLocality: "Addis Ababa",
    addressCountry: "ET",
  },
  hasMenu: {
    "@type": "Menu",
    url: `${process.env.NEXT_PUBLIC_SITE_URL ?? "https://addis-eats.vercel.app"}/menu`,
  },
};

export default function Page() {
  return (
    <main className="min-h-screen overflow-x-hidden bg-[#111315] text-white">
      <Script
        id="jsonld-restaurant"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(restaurantJsonLd) }}
      />

      <section className="bg-[#111315]">
        <div className="mx-auto grid max-w-7xl items-center gap-8 px-4 py-12 sm:px-6 sm:py-16 md:grid-cols-2 md:gap-10 md:py-20 lg:gap-16 lg:py-24">

          <div className="min-w-0">

            <h1 className="mt-5 text-3xl font-extrabold leading-tight tracking-tight text-white sm:mt-6 sm:text-5xl lg:text-6xl">
              Taste the best
              <span className="mt-1 block text-amber-400">
                food in Addis
              </span>
            </h1>

            <p className="mt-4 max-w-xl text-sm leading-7 text-gray-400 sm:mt-6 sm:text-base sm:leading-8 lg:text-lg">
              Discover delicious Ethiopian meals, burgers, pizza,
              drinks, and more. Order your favorite food with
              Addis Eats.
            </p>

            <div className="mt-6 flex flex-wrap gap-3 sm:mt-8">
              <Link
                href="/menu"
                className="inline-flex min-h-11 items-center justify-center rounded-full bg-amber-400 px-5 py-3 text-sm font-bold text-[#171717] transition-colors hover:bg-amber-300 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-amber-400 sm:px-7 sm:text-base"
              >
                Explore Menu
              </Link>
            </div>
          </div>

          <div className="mx-auto w-full min-w-0 max-w-xl">
            <div className="overflow-hidden rounded-2xl border border-white/10 shadow-2xl sm:rounded-3xl md:rounded-[2rem]">
              <Image
                src="/images/hero-food.png"
                alt="Delicious food served at Addis Eats"
                width={700}
                height={500}
                priority
                sizes="(max-width: 767px) 100vw, (max-width: 1279px) 50vw, 600px"
                className="aspect-[7/5] h-auto max-h-[480px] w-full object-cover"
              />
            </div>
          </div>

        </div>
      </section>

      <section className="border-t border-white/5 bg-[#17191B] py-12 sm:py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">

          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-bold uppercase tracking-widest text-amber-400">
              Explore
            </p>

            <h2 className="mt-2 text-2xl font-extrabold tracking-tight text-white sm:text-3xl lg:text-4xl">
              What are you craving?
            </h2>

            <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-gray-400 sm:text-base sm:leading-7">
              Choose from some of our most popular food categories.
            </p>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-4 min-[400px]:grid-cols-2 sm:mt-10 sm:gap-5 lg:grid-cols-4">

            {[
              {
                name: "Ethiopian",
                emoji: "🍛",
                description: "Traditional Ethiopian favorites",
                href: "/menu?category=Ethiopian",
              },
              {
                name: "Pizza",
                emoji: "🍕",
                description: "Fresh and delicious pizza",
                href: "/menu?category=Pizza",
              },
              {
                name: "Burgers",
                emoji: "🍔",
                description: "Juicy burgers made fresh",
                href: "/menu?category=Burgers",
              },
              {
                name: "Drinks",
                emoji: "🥤",
                description: "Refreshing drinks for every meal",
                href: "/menu?category=Drinks",
              },
            ].map((category) => (
              <Link
                key={category.name}
                href={category.href}
                className="group min-w-0 rounded-2xl border border-white/10 bg-[#202326] p-5 transition-colors hover:border-amber-400/50 hover:bg-[#272A2D] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-400 sm:p-6"
              >
                <div className="text-3xl sm:text-4xl" aria-hidden="true">
                  {category.emoji}
                </div>

                <h3 className="mt-4 text-base font-bold text-white transition-colors group-hover:text-amber-400 sm:text-lg">
                  {category.name}
                </h3>

                <p className="mt-2 text-sm leading-6 text-gray-400">
                  {category.description}
                </p>
              </Link>
            ))}

          </div>
        </div>
      </section>

      <section className="bg-[#111315] py-12 sm:py-16 lg:py-20">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-5 px-4 sm:px-6 md:grid-cols-2 lg:grid-cols-3 lg:gap-6">

          <div className="min-w-0 rounded-2xl border border-white/10 bg-[#1B1E20] p-5 sm:p-7">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-400/10 text-2xl">
              🍽️
            </div>

            <h3 className="mt-4 text-lg font-bold text-white sm:mt-5 sm:text-xl">
              Delicious Food
            </h3>

            <p className="mt-3 text-sm leading-7 text-gray-400">
              Enjoy a variety of tasty meals prepared with quality
              ingredients.
            </p>
          </div>

          <div className="min-w-0 rounded-2xl border border-white/10 bg-[#1B1E20] p-5 sm:p-7">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-400/10 text-2xl">
              ⚡
            </div>

            <h3 className="mt-4 text-lg font-bold text-white sm:mt-5 sm:text-xl">
              Easy Ordering
            </h3>

            <p className="mt-3 text-sm leading-7 text-gray-400">
              Browse the menu, add your favorites to the cart, and
              checkout easily.
            </p>
          </div>

          <div className="min-w-0 rounded-2xl border border-white/10 bg-[#1B1E20] p-5 sm:p-7 md:col-span-2 lg:col-span-1">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-400/10 text-2xl">
              ❤️
            </div>

            <h3 className="mt-4 text-lg font-bold text-white sm:mt-5 sm:text-xl">
              Made for Addis
            </h3>

            <p className="mt-3 text-sm leading-7 text-gray-400">
              A simple food ordering experience designed for Addis
              Eats customers.
            </p>
          </div>

        </div>
      </section>

    </main>
  );
}