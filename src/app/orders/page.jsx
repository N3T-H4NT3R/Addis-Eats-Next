import OrdersClient from "./OrdersClient";

export const metadata = {
  title: "My Orders",
  description:
    "View and track all your Addis Eats orders. Real-time status updates for every delivery.",
  robots: { index: false, follow: false },
};

export default function OrdersPage() {
  return <OrdersClient />;
}
