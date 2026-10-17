
"use client";

import Link from "next/link";
import {
  usePathname,
  useRouter,
  useSearchParams,
} from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  Search,
  X,
  ShoppingCart,
  Menu as MenuIcon,
  LogOut,
} from "lucide-react";

import { useCartStore } from "../store/cartStore";

const EMPTY_CART = [];

export default function Navbar({ isAuthenticated, userId, role }) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const mobileMenuToggleRef = useRef(null);
  const searchToggleRef = useRef(null);
  const currentUrlSearch = searchParams.get("search") || "";
  const [searchDraft, setSearchDraft] = useState(null);
  const searchText = searchDraft?.url === currentUrlSearch
    ? searchDraft.text
    : currentUrlSearch;

  const cart = useCartStore((state) =>
    userId
      ? state.cartsByUser?.[String(userId)] ?? EMPTY_CART
      : EMPTY_CART
  );

  const cartQuantity = cart.reduce(
    (total, item) => total + Number(item.quantity || 1),
    0
  );

  const navLinks = [
    { name: "Home",  href: "/" },
    { name: "Menu",  href: "/menu" },
    ...(isAuthenticated
      ? [
          ...(role === "admin"
            ? []
            : [
                { name: "Orders", href: "/orders" },
                { name: "Favorites", href: "/favorites" },
              ]),
          ...(["staff", "admin"].includes(role)
            ? [
                { name: "Dashboard", href: "/dashboard" },
                { name: "Kitchen", href: "/kitchen" },
              ]
            : []),
        ]
      : [{ name: "Sign In", href: "/signin" }]),
  ];

  const isActive = (href) =>
    href === "/"
      ? pathname === "/"
      : pathname === href || pathname.startsWith(`${href}/`);

  const closeMenus = () => {
    setMobileOpen(false);
    setSearchOpen(false);
  };

  async function handleSignOut() {
    await fetch("/api/auth/logout", { method: "POST" });
    closeMenus();
    router.push("/");
    router.refresh();
  }

  useEffect(() => {
    if (!mobileOpen && !searchOpen) return undefined;

    function handleEscape(event) {
      if (event.key !== "Escape") return;

      event.preventDefault();
      const focusTarget = mobileOpen
        ? mobileMenuToggleRef.current
        : searchToggleRef.current;
      closeMenus();
      window.requestAnimationFrame(() => focusTarget?.focus());
    }

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [mobileOpen, searchOpen]);

  useEffect(() => {
    const timer = setTimeout(() => {
      const query = searchText.trim();

      if (pathname !== "/menu" && !query) {
        return;
      }

      const params = new URLSearchParams(searchParams.toString());

      if (query) {
        params.set("search", query);
      } else {
        params.delete("search");
      }

      params.delete("page");

      const queryString = params.toString();
      const target = queryString ? `/menu?${queryString}` : "/menu";

      const currentTarget =
        pathname === "/menu"
          ? `/menu${
              searchParams.toString()
                ? `?${searchParams.toString()}`
                : ""
            }`
          : "";

      if (target !== currentTarget) {
        router.replace(target, { scroll: false });
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchText, pathname, router, searchParams]);

  const openSearch = () => {
    setSearchOpen(true);
    setMobileOpen(false);
  };

  const closeSearch = () => {
    setSearchOpen(false);
    window.requestAnimationFrame(() => searchToggleRef.current?.focus());
  };

  const clearSearch = () => {
    setSearchDraft({ url: currentUrlSearch, text: "" });

    if (pathname !== "/menu") {
      router.push("/menu");
    }
  };

  const submitSearch = () => {
    const query = searchText.trim();

    setSearchOpen(false);

    const target = query
      ? `/menu?${new URLSearchParams({ search: query }).toString()}`
      : "/menu";

    const currentTarget = `${pathname}${
      searchParams.toString() ? `?${searchParams.toString()}` : ""
    }`;

    if (target !== currentTarget) {
      router.push(target);
    }
  };

  return (
    <nav className="sticky top-0 z-50 border-b border-[#292d31] bg-[#111315]/95 text-white shadow-lg backdrop-blur-md">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between gap-2 px-3 sm:h-20 sm:gap-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          onClick={closeMenus}
          className="shrink-0 text-lg font-extrabold tracking-tight text-green-500 transition hover:text-green-400 min-[400px]:text-xl"
        >
          Addis Eats
        </Link>

        <div className="hidden items-center gap-5 md:flex lg:gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={closeMenus}
              aria-current={isActive(link.href) ? "page" : undefined}
              className={`relative py-2 text-sm font-medium transition-colors lg:text-base ${
                isActive(link.href)
                  ? "text-green-400"
                  : "text-gray-300 hover:text-green-400"
              }`}
            >
              {link.name}

              <span
                className={`absolute bottom-0 left-0 h-0.5 rounded-full bg-green-500 transition-all duration-300 ${
                  isActive(link.href) ? "w-full" : "w-0"
                }`}
              />
            </Link>
          ))}
        </div>

        <div
          className={`min-w-0 flex-1 md:flex-none ${
            searchOpen ? "hidden sm:block" : "hidden"
          }`}
        >
          <div className="mx-auto flex max-w-sm items-center rounded-full border border-[#292d31] bg-[#1b1e21] px-3 py-2 transition focus-within:border-green-500 md:w-56 lg:w-64">
            <Search
              size={18}
              aria-hidden="true"
              className="shrink-0 text-green-400"
            />

            <input
              type="search"
              value={searchText}
              onChange={(event) =>
                setSearchDraft({ url: currentUrlSearch, text: event.target.value })
              }
              onKeyDown={(event) => {
                if (event.key === "Escape") setSearchOpen(false);
                if (event.key === "Enter") submitSearch();
              }}
              placeholder="Search dishes..."
              aria-label="Search dishes"
              className="ml-2 w-full min-w-0 bg-transparent text-sm text-white outline-none placeholder:text-gray-500"
            />

            {searchText && (
              <button
                type="button"
                onClick={clearSearch}
                aria-label="Clear search"
                className="ml-1 shrink-0 text-gray-400 transition hover:text-green-400"
              >
                <X size={16} aria-hidden="true" />
              </button>
            )}

            <button
              type="button"
              onClick={closeSearch}
              aria-label="Close search"
              className="ml-1 shrink-0 text-gray-400 transition hover:text-green-400"
            >
              <X size={18} aria-hidden="true" />
            </button>
          </div>
        </div>

        <div
          className={`flex shrink-0 items-center gap-0.5 sm:gap-2 ${
            searchOpen ? "hidden sm:flex" : "flex"
          }`}
        >
          <button
            type="button"
            onClick={openSearch}
            ref={searchToggleRef}
            aria-label="Open search"
            aria-expanded={searchOpen}
            className="rounded-full p-2 text-gray-300 transition hover:bg-[#1b1e21] hover:text-green-400 sm:p-2.5"
          >
            <Search size={20} aria-hidden="true" />
          </button>

          <Link
            href="/cart"
            onClick={closeMenus}
            aria-label={`Shopping cart, ${cartQuantity} items`}
            className="relative min-w-11 rounded-full p-2 text-gray-300 transition hover:bg-[#1b1e21] hover:text-green-400 sm:p-2.5"
          >
            <ShoppingCart size={21} aria-hidden="true" />

            {cartQuantity > 0 && (
              <span
                aria-hidden="true"
                className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-green-500 px-1 text-xs font-bold text-white"
              >
                {cartQuantity}
              </span>
            )}
          </Link>

          {isAuthenticated && (
            <button
              type="button"
              onClick={handleSignOut}
              aria-label="Sign out"
              className="hidden items-center gap-1.5 rounded-lg border border-[#292d31] bg-[#1b1e21] px-3 py-1.5 text-sm font-medium text-gray-300 transition hover:border-red-800 hover:bg-red-950/40 hover:text-red-400 md:flex"
            >
              <LogOut size={15} aria-hidden="true" />
              Sign Out
            </button>
          )}

          <button
            type="button"
            ref={mobileMenuToggleRef}
            onClick={() => {
              setMobileOpen((open) => !open);
              setSearchOpen(false);
            }}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
            aria-controls="mobile-navigation"
            className="rounded-full p-2 text-gray-300 transition hover:bg-[#1b1e21] hover:text-green-400 md:hidden"
          >
            {mobileOpen ? (
              <X size={23} aria-hidden="true" />
            ) : (
              <MenuIcon size={23} aria-hidden="true" />
            )}
          </button>
        </div>
      </div>

      {searchOpen && (
        <div className="border-t border-[#292d31] bg-[#111315] px-3 py-3 sm:hidden">
          <div className="flex items-center gap-2 rounded-xl border border-[#35393e] bg-[#1b1e21] px-3 py-3 focus-within:border-green-500">
            <Search
              size={18}
              aria-hidden="true"
              className="shrink-0 text-green-400"
            />

            <input
              type="search"
              value={searchText}
              onChange={(event) =>
                setSearchDraft({ url: currentUrlSearch, text: event.target.value })
              }
              onKeyDown={(event) => {
                if (event.key === "Enter") submitSearch();
              }}
              placeholder="Search dishes..."
              aria-label="Search dishes"
              className="min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-gray-500"
            />

            {searchText && (
              <button
                type="button"
                onClick={clearSearch}
                aria-label="Clear search"
                className="text-gray-400 hover:text-green-400"
              >
                <X size={18} aria-hidden="true" />
              </button>
            )}
          </div>
        </div>
      )}

      {mobileOpen && (
        <div id="mobile-navigation" className="border-t border-[#292d31] bg-[#111315] px-3 py-4 sm:px-6 md:hidden">
          <div className="mx-auto flex max-w-7xl flex-col gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={closeMenus}
                aria-current={isActive(link.href) ? "page" : undefined}
                className={`rounded-xl px-4 py-3 text-sm font-medium transition sm:text-base ${
                  isActive(link.href)
                    ? "bg-[#1b1e21] text-green-400"
                    : "text-gray-300 hover:bg-[#1b1e21] hover:text-green-300"
                }`}
              >
                {link.name}
              </Link>
            ))}

            <Link
              href="/cart"
              onClick={closeMenus}
              className="flex items-center justify-between rounded-xl px-4 py-3 text-sm font-medium text-gray-300 transition hover:bg-[#1b1e21] sm:text-base"
            >
              <span>Shopping Cart</span>
              <span className="rounded-full bg-green-500 px-2 py-0.5 text-xs font-bold text-white">
                {cartQuantity}
              </span>
            </Link>

            {isAuthenticated && (
              <button
                type="button"
                onClick={handleSignOut}
                className="flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-medium text-red-400 transition hover:bg-red-950/40 sm:text-base"
              >
                <LogOut size={17} aria-hidden="true" />
                Sign Out
              </button>
            )}

            <div className="mt-2 border-t border-[#292d31] px-4 py-3 sm:hidden">
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}