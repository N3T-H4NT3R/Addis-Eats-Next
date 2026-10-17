import { getOrders, saveOrder } from "@/app/lib/orders";
import { Dishes } from "@/app/lib/Dishes";
import { getSession } from "@/app/lib/session";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const allOrders = await getOrders();

    const visibleOrders = session.role === "admin"
      ? allOrders
      : allOrders.filter(
          (order) => String(order.userId) === String(session.id)
        );

    return NextResponse.json({
      username: session.username,
      role: session.role,
      orders: visibleOrders,
    });
  } catch (error) {
    console.error("Failed to fetch orders:", error);

    return NextResponse.json(
      { message: "Failed to fetch orders" },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  const session = await getSession();

  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const deliveryAddress = body?.deliveryAddress?.trim();
    const phone = body?.phone?.trim();
    if (
      typeof body?.id !== "string" ||
      !/^ORD-[A-Za-z0-9-]{1,64}$/.test(body.id) ||
      !Array.isArray(body.items) ||
      body.items.length < 1 ||
      body.items.length > 30 ||
      typeof deliveryAddress !== "string" ||
      deliveryAddress.length < 5 ||
      deliveryAddress.length > 300 ||
      typeof phone !== "string" ||
      phone.length < 7 ||
      phone.length > 20
    ) {
      return NextResponse.json({ message: "Invalid order details" }, { status: 400 });
    }

    const dishById = new Map(Dishes.map((dish) => [String(dish.id), dish]));
    const items = [];

    for (const submittedItem of body.items) {
      const dish = dishById.get(String(submittedItem?.id));
      const quantity = Number(submittedItem?.quantity ?? 1);

      if (!dish || !Number.isInteger(quantity) || quantity < 1 || quantity > 99) {
        return NextResponse.json({ message: "Invalid order details" }, { status: 400 });
      }

      items.push({
        id: dish.id,
        name: dish.name,
        price: dish.price,
        quantity,
      });
    }

    const order = await saveOrder({
      id: String(body.id),
      userId: String(session.id),
      items,
      deliveryAddress,
      phone,
      status: "confirmed",
      total: items.reduce((sum, item) => sum + item.price * item.quantity, 0),
      createdAt: new Date().toISOString(),
    });

    return NextResponse.json({ order }, { status: 201 });
  } catch {
    return NextResponse.json({ message: "Invalid order details" }, { status: 400 });
  }
}