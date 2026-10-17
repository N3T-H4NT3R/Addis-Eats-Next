import { Dishes } from "@/app/lib/Dishes";
import { NextResponse } from "next/server";

export function GET() {
  return NextResponse.json(Dishes, {
    headers: {
      "Cache-Control":
        "public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800",
    },
  });
}
