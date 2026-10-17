"use client";
import React from "react";
import { Moon, Sun } from "lucide-react";
import { useThemeStore } from "@/app/store/themeStore";



const Theme = () => {
  const darkMode = useThemeStore((state) => state.darkMode);
  const toggleTheme = useThemeStore((state) => state.toggleTheme);

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={darkMode ? "Switch to light theme" : "Switch to dark theme"}
      aria-pressed={darkMode}
      className="cursor-pointer rounded-full p-2.5 text-gray-600 transition-all duration-300 hover:text-white hover:rotate-12"
    >
      {darkMode ? (
        <Sun size={21} />
      ) : (
        <Moon size={21} />
      )}
    </button>
  );
};

export default Theme;