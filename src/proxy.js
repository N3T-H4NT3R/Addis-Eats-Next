import { NextResponse } from "next/server";

export function proxy(request) {
  const session = request.cookies.get("session");
  const pathname = request.nextUrl.pathname;

  if (pathname === "/signin" && session) {
    return NextResponse.redirect(new URL("/menu", request.url));
  }

  const protectedRoutes = ["/checkout", "/kitchen", "/orders"];
  const isProtectedRoute = protectedRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );

  if (isProtectedRoute && !session) {
    const loginUrl = new URL("/signin", request.url);
    loginUrl.searchParams.set("next", pathname + request.nextUrl.search);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/signin",
    "/checkout/:path*",
    "/kitchen/:path*",
    "/orders/:path*",
  ],
};
