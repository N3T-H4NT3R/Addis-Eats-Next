import { create } from "zustand";
import { persist } from "zustand/middleware";



export const useOrderStore = create(
  persist(
    (set) => ({
      ordersByUser: {},

      addOrder: (userId, order) =>
        set((state) => {
          const id = String(userId);
          const userOrders = state.ordersByUser[id] || [];

          if (userOrders.some((savedOrder) => savedOrder.id === order.id)) {
            return state;
          }

          return {
            ordersByUser: {
              ...state.ordersByUser,
              [id]: [...userOrders, order],
            },
          };
        }),

      updateOrderStatus: (userId, orderId, status) =>
        set((state) => ({
          ordersByUser: {
            ...state.ordersByUser,
            [String(userId)]: (
              state.ordersByUser[String(userId)] || []
            ).map((order) =>
              order.id === orderId
                ? { ...order, status }
                : order
            ),
          },
        })),

      removeOrder: (userId, orderId) =>
        set((state) => ({
          ordersByUser: {
            ...state.ordersByUser,
            [String(userId)]: (
              state.ordersByUser[String(userId)] || []
            ).filter((order) => order.id !== orderId),
          },
        })),

      clearOrders: (userId) =>
        set((state) => ({
          ordersByUser: {
            ...state.ordersByUser,
            [String(userId)]: [],
          },
        })),
    }),
    {
      name: "addis-eats-orders",
    }
  )
)