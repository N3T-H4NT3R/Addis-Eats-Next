import { getSession } from "@/app/lib/session";
import { getOrderStatus, getOrders } from "@/app/lib/orders";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const orders = []

export async function GET() {
  const session = await getSession();

  if (!session) {
    return NextResponse.json(
      { message: "Unauthorized" },
      { status: 401 }
    );
  }

  if (session.role !== "staff" && session.role !== "admin") {
    return NextResponse.json(
      { message: "Forbidden" },
      { status: 403 }
    );
  }

  const customerOrders = await getOrders();
  const mergedOrders = orders.map((order) => ({
    ...order,
    status: getOrderStatus(order.id, order.status),
  }));
  for (const order of customerOrders) {
    if (!mergedOrders.some((item) => String(item.id) === String(order.id))) {
      mergedOrders.push(order);
    }
  }

  return NextResponse.json({ orders: mergedOrders });
}