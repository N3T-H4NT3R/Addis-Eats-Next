import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useThemeStore = create(
  persist(
    (set) => ({
      darkMode: false,

      toggleTheme: () =>
        set((state) => ({
          darkMode: !state.darkMode,
        })),
        
    }),
    {
      name: "theme-storage",
    }
  )
);