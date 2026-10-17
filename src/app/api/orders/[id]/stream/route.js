import { getOrders } from "@/app/lib/orders";
import { getSession } from "@/app/lib/session";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const UPDATE_INTERVAL_MS = 2000;
const DELIVERY_DURATION_MS = 120000;

export async function GET(request, { params }) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const orders = await getOrders();
  const order = orders.find(
    (item) => String(item.id) === String(id) && String(item.userId) === String(session.id)
  );

  if (!order) {
    return NextResponse.json({ message: "Order not found" }, { status: 404 });
  }

  const encoder = new TextEncoder();
  let timer;
  let controllerRef;
  let closed = false;
  let currentStatus = order.status || "confirmed";
  let currentLocation = null;

  const stream = new ReadableStream({
    start(controller) {
      controllerRef = controller;

      const emitStatus = (status, updatedAt = new Date().toISOString()) => {
        if (closed || request.signal.aborted) return;
        controller.enqueue(
          encoder.encode(
            `event: status\ndata: ${JSON.stringify({
              orderId: order.id,
              status,
              updatedAt,
            })}\n\n`
          )
        );
      };

      const emitLocation = (latestOrder) => {
        if (latestOrder.status !== "delivering") return;
        const destination = getDeliveryCoordinates(latestOrder.deliveryAddress);
        const start = [destination[0] - 0.008, destination[1] - 0.009];
        const deliveringAt = Date.parse(latestOrder.deliveringAt) || Date.now();
        const progress = Math.min((Date.now() - deliveringAt) / DELIVERY_DURATION_MS, 1);
        const location = [
          start[0] + (destination[0] - start[0]) * progress,
          start[1] + (destination[1] - start[1]) * progress,
        ];

        if (location[0] === currentLocation?.[0] && location[1] === currentLocation?.[1]) return;
        currentLocation = location;
        controller.enqueue(encoder.encode(
          `event: location\ndata: ${JSON.stringify({ latitude: location[0], longitude: location[1], updatedAt: new Date().toISOString() })}\n\n`
        ));
      };

      const emitUpdates = async () => {
        if (closed || request.signal.aborted) return;
        const latestOrder = (await getOrders()).find((item) =>
          String(item.id) === String(id) && String(item.userId) === String(session.id)
        );
        if (!latestOrder) return;

        const nextStatus = latestOrder.status || "confirmed";
        if (nextStatus !== currentStatus) {
          currentStatus = nextStatus;
          emitStatus(currentStatus);
        }

        emitLocation(latestOrder);
        if (currentStatus === "delivered") {
          closed = true;
          clearInterval(timer);
          controller.close();
        }
      };

      emitStatus(currentStatus);
      emitUpdates();
      if (!closed) timer = setInterval(emitUpdates, UPDATE_INTERVAL_MS);
    },
    cancel() {
      closed = true;
      clearInterval(timer);
    },
  });

  request.signal.addEventListener(
    "abort",
    () => {
      closed = true;
      clearInterval(timer);
      try {
        controllerRef?.close();
      } catch {
      }
    },
    { once: true }
  );

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}

function getDeliveryCoordinates(address = "") {
  const neighborhoods = {
    Bole: [8.995, 38.788],
    Kazanchis: [9.016, 38.762],
    Piassa: [9.035, 38.746],
  };
  const neighborhood = Object.keys(neighborhoods).find((name) => address.includes(name));
  return neighborhoods[neighborhood] || [9.012, 38.761];
}