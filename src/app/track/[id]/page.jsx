import TrackClient from "./TrackClient";

export const metadata = {
  title: "Track your delivery",
  robots: { index: false, follow: false },
};

export default async function TrackPage({ params }) {
  const { id } = await params;
  return <TrackClient orderId={id} />;
}