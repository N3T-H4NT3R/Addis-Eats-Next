
import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useFavoriteStore = create(
  persist(
    (set) => ({
      favoritesByUser: {},

      toggleFavorite: (userId, item) =>
        set((state) => {
          const id = String(userId);

          const saved = state.favoritesByUser[id];
          const favorites = Array.isArray(saved) ? saved : [];

          const exists = favorites.some(
            (favorite) => String(favorite.id) === String(item.id)
          );

          return {
            favoritesByUser: {
              ...state.favoritesByUser,
              [id]: exists
                ? favorites.filter(
                    (favorite) =>
                      String(favorite.id) !== String(item.id)
                  )
                : [...favorites, item],
            },
          };
        }),

      removeFavorite: (userId, itemId) =>
        set((state) => {
          const id = String(userId);
          const saved = state.favoritesByUser[id];
          const favorites = Array.isArray(saved) ? saved : [];

          return {
            favoritesByUser: {
              ...state.favoritesByUser,
              [id]: favorites.filter(
                (item) => String(item.id) !== String(itemId)
              ),
            },
          };
        }),

      clearFavorites: (userId) =>
        set((state) => ({
          favoritesByUser: {
            ...state.favoritesByUser,
            [String(userId)]: [],
          },
        })),
    }),
    {
      name: "addis-eats-favorites",
      partialize: (state) => ({
        favoritesByUser: state.favoritesByUser,
      }),
    }
  )
);