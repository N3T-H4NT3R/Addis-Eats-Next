
import Link from "next/link";
import {
  MapPin,
  Phone,
  Mail,
} from "lucide-react";

const Footer = () => {
  return (
    <footer className="border-t border-[#292d31] bg-[#111315] text-gray-300">

      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 px-5 py-10 sm:grid-cols-2 sm:gap-12 sm:px-6 sm:py-14 lg:grid-cols-3 lg:px-8">

        <div>
          <Link
            href="/"
            className="inline-block text-2xl font-extrabold tracking-tight text-green-400 transition duration-300 hover:text-green-300"
          >
            Addis Eats
          </Link>

          <p className="mt-4 max-w-xs text-sm leading-6 text-gray-400">
            Discover delicious meals from Addis Eats and enjoy
            your favorite food wherever you are.
          </p>

          <div className="mt-6 flex items-center gap-3">
            <span aria-hidden="true" className="flex h-11 w-11 items-center justify-center rounded-full border border-[#292d31] bg-[#1b1e21] text-sm font-bold text-gray-300">
              f
            </span>

            <span aria-hidden="true" className="flex h-11 w-11 items-center justify-center rounded-full border border-[#292d31] bg-[#1b1e21] text-sm font-bold text-gray-300">
              ◎
            </span>

            <span aria-hidden="true" className="flex h-11 w-11 items-center justify-center rounded-full border border-[#292d31] bg-[#1b1e21] text-sm font-bold text-gray-300">
              𝕏
            </span>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-bold uppercase tracking-wider text-white">
            Quick Links
          </h3>

          <div className="mt-5 flex flex-col items-start gap-3">
            <Link
              href="/"
              className="text-sm text-gray-400 transition-colors duration-200 hover:text-green-400"
            >
              Home
            </Link>

            <Link
              href="/menu"
              className="text-sm text-gray-400 transition-colors duration-200 hover:text-green-400"
            >
              Menu
            </Link>

            <Link
              href="/orders"
              className="text-sm text-gray-400 transition-colors duration-200 hover:text-green-400"
            >
              Orders
            </Link>

            <Link
              href="/cart"
              className="text-sm text-gray-400 transition-colors duration-200 hover:text-green-400"
            >
              Cart
            </Link>

            <Link
              href="/signin"
              className="text-sm text-gray-400 transition-colors duration-200 hover:text-green-400"
            >
              Sign In
            </Link>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-bold uppercase tracking-wider text-white">
            Contact Us
          </h3>

          <div className="mt-5 flex flex-col gap-4">

            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#1b1e21] text-green-400">
                <MapPin size={17} />
              </div>

              <p className="pt-1 text-sm leading-5 text-gray-400">
                Addis Ababa, Ethiopia
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#1b1e21] text-green-400">
                <Phone size={17} />
              </div>

              <a
                href="tel:+251909739087"
                className="min-w-0 break-all text-sm text-gray-400 transition-colors hover:text-green-400"
              >
                +251 909 739 087
              </a>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#1b1e21] text-green-400">
                <Mail size={17} />
              </div>

              <a
                href="mailto:info@addiseats.com"
                className="min-w-0 break-all text-sm text-gray-400 transition-colors hover:text-green-400"
              >
                info@addiseats.com
              </a>
            </div>

          </div>
        </div>
      </div>

      <div className="border-t border-[#292d31] bg-[#0d0f10]">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-5 py-5 text-center sm:flex-row sm:px-6 sm:text-left lg:px-8">

          <p className="text-sm text-gray-400">
            © 2026{" "}
            <span className="font-semibold text-green-400">
              Addis Eats
            </span>
            . All rights reserved.
          </p>

          <p className="text-xs text-gray-500">
            Made with ❤️ in Addis Ababa
          </p>

        </div>
      </div>

    </footer>
  );
};

export default Footer;