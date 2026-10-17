import { Dishes } from "@/app/lib/Dishes";
import { NextResponse } from "next/server";

export async function GET(request, { params }) {
  const { id } = await params;

  const dish = Dishes.find((d) => d.id === Number(id));

  if (!dish) {
    return NextResponse.json(
      { message: "Dish not found" },
      { status: 404 }
    );
  }

  return NextResponse.json(dish, {
    headers: {
      "Cache-Control":
        "public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800",
    },
  });
}
