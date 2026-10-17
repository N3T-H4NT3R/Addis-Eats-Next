import CartClient from "./CartClient";

export const metadata = {
  title: "Your Cart",
  description: "Review and manage the items in your Addis Eats shopping cart before checkout.",
  robots: { index: false, follow: false },
};

export default function CartPage() {
  return <CartClient />;
}
