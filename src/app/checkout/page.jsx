import CheckoutClient from "./CheckoutClient";

export const metadata = {
  title: "Checkout",
  description: "Complete your Addis Eats order. Enter your delivery address and place your order.",
  robots: { index: false, follow: false },
};

export default function CheckoutPage() {
  return <CheckoutClient />;
}
