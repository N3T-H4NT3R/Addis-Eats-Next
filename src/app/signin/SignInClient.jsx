"use client";

import Link from "next/link";
import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function SignInContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const requestedNext = searchParams.get("next");
  const next =
    requestedNext?.startsWith("/") &&
    !requestedNext.startsWith("//") &&
    !requestedNext.startsWith("/\\") &&
    requestedNext !== "/signin"
      ? requestedNext
      : "/menu";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Invalid email or password");
        return;
      }

      router.push(next);
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#111315] px-4 py-10 text-gray-100 sm:px-6">
      <div className="w-full max-w-sm">

        <div className="mb-7 text-center">
          <Link
            href="/"
            className="text-2xl font-black tracking-tight text-gray-400 transition hover:text-gray-400 sm:text-3xl"
          >
            ADDIS EATS
          </Link>

          <p className="mt-2 text-sm text-gray-500">
            Delicious food, just a sign-in away.
          </p>
        </div>

        <div className="rounded-2xl border border-[#292d31] bg-[#17191c] p-5 shadow-2xl shadow-black/20 sm:p-7">

          <div className="mb-7">
            <h1 className="text-2xl font-bold text-white">
              Welcome back
            </h1>

            <p className="mt-2 text-sm leading-6 text-gray-400">
              Sign in to your account to continue.
            </p>
          </div>

          {error && (
            <div
              role="alert"
              className="mb-5 rounded-lg border border-red-900/60 bg-red-950/40 px-3 py-3 text-sm text-red-300"
            >
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">

            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-medium text-gray-300"
              >
                Email
              </label>

              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="w-full rounded-xl border border-[#35393e] bg-[#111315] px-4 py-3 text-sm text-white outline-none transition placeholder:text-gray-600 focus:border-gray-400 focus:ring-2 focus:ring-gray-400/20"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-sm font-medium text-gray-300"
              >
                Password
              </label>

              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                className="w-full rounded-xl border border-[#35393e] bg-[#111315] px-4 py-3 text-sm text-white outline-none transition placeholder:text-gray-600 focus:border-gray-400 focus:ring-2 focus:ring-gray-400/20"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-2 w-full rounded-xl bg-gray-400 py-3.5 text-sm font-bold text-white transition duration-200 hover:bg-green-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-400 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <div className="my-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-[#292d31]" />
            <span className="text-xs font-medium text-gray-500">
              OR
            </span>
            <div className="h-px flex-1 bg-[#292d31]" />
          </div>

          <p className="text-center text-sm text-gray-400">
            Don&apos;t have an account?{" "}
            <Link href="mailto:info@addiseats.com" className="font-semibold text-gray-300 hover:text-white">
              Contact support
            </Link>
          </p>
        </div>

        <p className="mt-6 text-center text-xs text-gray-600">
          © 2026 Addis Eats. All rights reserved.
        </p>
      </div>
    </main>
  );
}

export default function SignInPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#111315]">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#292d31] border-t-gray-400" />
        </div>
      }
    >
      <SignInContent />
    </Suspense>
  );
}