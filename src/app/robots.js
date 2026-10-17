export default function robots() {
  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://addis-eats.vercel.app";

  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/menu"],
        disallow: [
          "/orders",
          "/checkout",
          "/kitchen",
          "/favorites",
          "/cart",
          "/signin",
          "/signup",
          "/api/",
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
