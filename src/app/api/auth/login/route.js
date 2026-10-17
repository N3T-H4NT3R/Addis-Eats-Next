import { users } from "@/app/lib/users";
import { NextResponse } from "next/server";



export async function POST(request) {
  const { email, password } = await request.json();

  const user = users.find(
    (user) =>
      user.email === email &&
      user.password === password
  );

  if (!user) {
    return NextResponse.json(
      { message: "Invalid email or password" },
      { status: 401 }
    );
  }

  const response = NextResponse.json({
    message: "Login successful",
  });

  response.cookies.set("session", user.id, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });

  return response;
}