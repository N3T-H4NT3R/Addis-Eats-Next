import { Dishes } from "@/app/lib/Dishes";


export default function sitemap() {
  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://addis-eats-next-js-five.vercel.app";

  const staticRoutes = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/menu`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
  ];

  const dishRoutes = Dishes.map((dish) => ({
    url: `${baseUrl}/menu/${dish.id}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  return [...staticRoutes, ...dishRoutes];
}
