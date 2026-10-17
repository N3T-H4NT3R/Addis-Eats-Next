import { getSession } from "@/app/lib/session";
import { updateOrderStatus } from "@/app/lib/orders";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const VALID_STATUSES = ["confirmed", "preparing", "ready", "delivering", "delivered"];

export async function PATCH(request, { params }) {
  const session = await getSession();

  if (!session) {
    return NextResponse.json(
      { message: "Unauthorized" },
      { status: 401 }
    );
  }

  if (session.role !== "staff" && session.role !== "admin") {
    return NextResponse.json(
      { message: "Forbidden: staff only" },
      { status: 403 }
    );
  }

  const { id } = await params;
  const body = await request.json();
  const { status } = body;

  if (!VALID_STATUSES.includes(status)) {
    return NextResponse.json(
      { message: `Invalid status. Must be one of: ${VALID_STATUSES.join(", ")}` },
      { status: 400 }
    );
  }

  const updatedOrder = await updateOrderStatus(id, status);

  return NextResponse.json({
    order: { id, status, ...(updatedOrder?.deliveringAt ? { deliveringAt: updatedOrder.deliveringAt } : {}) },
  });
}
