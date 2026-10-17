
import { Suspense } from "react";
import Category from "./Category";

export default function MenuLayout({ children }) {
  return (
    <main className="min-h-screen bg-[#111315] text-gray-100">
      <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
        <div className="grid grid-cols-1 gap-6 md:gap-8 lg:grid-cols-[220px_minmax(0,1fr)]">

          <aside className="min-w-0">
            <Suspense
              fallback={
                <div className="rounded-2xl border border-[#292d31] bg-[#111315] p-4 shadow-sm sm:p-5">
                  <h2 className="mb-5 text-lg font-bold text-white">
                    Categories
                  </h2>

                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-1">
                    <div className="h-11 animate-pulse rounded-xl bg-[#1b1e21]" />
                    <div className="h-11 animate-pulse rounded-xl bg-[#1b1e21]" />
                    <div className="h-11 animate-pulse rounded-xl bg-[#1b1e21]" />
                    <div className="h-11 animate-pulse rounded-xl bg-[#1b1e21]" />
                  </div>
                </div>
              }
            >
              <Category />
            </Suspense>
          </aside>

          <section className="min-w-0">
            {children}
          </section>

        </div>
      </div>
    </main>
  );
}