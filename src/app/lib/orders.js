
const orderStore = globalThis.addisEatsOrderStore ??= {
  orders: [],
  statusOverrides: new Map(),
  deliveryStartedAt: new Map(),
};

export const getOrders = async () =>
  orderStore.orders.map((order) => ({
    ...order,
    status: orderStore.statusOverrides.get(String(order.id)) ?? order.status,
    deliveringAt: orderStore.deliveryStartedAt.get(String(order.id)) ?? null,
  }));

export const getOrderStatus = (orderId, fallback) =>
  orderStore.statusOverrides.get(String(orderId)) ?? fallback;

export const saveOrder = async (order) => {
  const existingOrder = orderStore.orders.find(
    (savedOrder) =>
      String(savedOrder.id) === String(order.id) &&
      String(savedOrder.userId) === String(order.userId)
  );

  if (existingOrder) return existingOrder;

  orderStore.orders.push(order);
  return order;
};

export const updateOrderStatus = async (orderId, status) => {
  const id = String(orderId);
  orderStore.statusOverrides.set(id, status);

  if (status === "delivering" && !orderStore.deliveryStartedAt.has(id)) {
    orderStore.deliveryStartedAt.set(id, new Date().toISOString());
  } else if (status !== "delivering") {
    orderStore.deliveryStartedAt.delete(id);
  }

  const order = orderStore.orders.find((item) => String(item.id) === id);
  return order ? { ...order, status, deliveringAt: orderStore.deliveryStartedAt.get(id) ?? null } : null;
};