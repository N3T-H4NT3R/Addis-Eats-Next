import FavoritesClient from "./FavoritesClient";

export const metadata = {
  title: "My Favorites",
  description:
    "Your saved favourite dishes on Addis Eats. Quickly re-order the meals you love.",
  robots: { index: false, follow: false },
};

export default function FavoritesPage() {
  return <FavoritesClient />;
}
