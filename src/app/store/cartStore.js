
import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useCartStore = create(
  persist(
    (set) => ({
      cartsByUser: {},

      addToCart: (userId, item) => {
        if (userId == null || !item || item.id == null) {
          console.error(
            "addToCart requires a valid userId and item.",
            { userId, item }
          );
          return;
        }

        set((state) => {
          const id = String(userId);
          const cart = state.cartsByUser[id] || [];

          const existing = cart.find(
            (product) => String(product.id) === String(item.id)
          );

          const updatedCart = existing
            ? cart.map((product) =>
                String(product.id) === String(item.id)
                  ? {
                      ...product,
                      quantity:
                        Number(product.quantity || 1) +
                        Number(item.quantity || 1),
                    }
                  : product
              )
            : [
                ...cart,
                {
                  ...item,
                  quantity: Number(item.quantity || 1),
                },
              ];

          return {
            cartsByUser: {
              ...state.cartsByUser,
              [id]: updatedCart,
            },
          };
        });
      },

      removeFromCart: (userId, itemId) => {
        if (userId == null || itemId == null) return;

        set((state) => {
          const id = String(userId);

          return {
            cartsByUser: {
              ...state.cartsByUser,
              [id]: (state.cartsByUser[id] || []).filter(
                (item) => String(item.id) !== String(itemId)
              ),
            },
          };
        });
      },

      updateQuantity: (userId, itemId, quantity) => {
        if (userId == null || itemId == null) return;

        set((state) => {
          const id = String(userId);
          const newQuantity = Number(quantity);

          return {
            cartsByUser: {
              ...state.cartsByUser,
              [id]: (state.cartsByUser[id] || [])
                .map((item) =>
                  String(item.id) === String(itemId)
                    ? { ...item, quantity: newQuantity }
                    : item
                )
                .filter((item) => item.quantity > 0),
            },
          };
        });
      },

      clearCart: (userId) => {
        if (userId == null) return;

        set((state) => ({
          cartsByUser: {
            ...state.cartsByUser,
            [String(userId)]: [],
          },
        }));
      },
    }),
    {
      name: "addis-eats-carts",
    }
  )
);