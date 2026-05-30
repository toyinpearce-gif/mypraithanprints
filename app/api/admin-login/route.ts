import { NextResponse } from "next/server";
import { COOKIE_NAME, createAdminToken } from "../../../lib/auth";

export async function POST(request: Request) {
  const body = await request.json();
  const password = body.password || "";
  const expectedPassword = process.env.ADMIN_PASSWORD || "";

  if (!expectedPassword) {
    return NextResponse.json(
      { error: "ADMIN_PASSWORD is not configured in Vercel." },
      { status: 500 }
    );
  }

  if (password !== expectedPassword) {
    return NextResponse.json({ error: "Invalid admin password." }, { status: 401 });
  }

  const response = NextResponse.json({ success: true });
  response.cookies.set(COOKIE_NAME, createAdminToken(), {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
    path: "/",
    maxAge: 60 * 60 * 8
  });

  return response;
}
