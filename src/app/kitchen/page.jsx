import KitchenClient from "./KitchenClient";

export const metadata = {
  title: "Kitchen",
  description:
    "Addis Eats kitchen dashboard — manage and update live order statuses.",
  robots: { index: false, follow: false },
};

export default function KitchenPage() {
  return <KitchenClient />;
}
