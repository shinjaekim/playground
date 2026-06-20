import { NextRequest, NextResponse } from "next/server";
import { getSessionToken } from "@/lib/auth";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname === "/admin/login") return NextResponse.next();

  const cookie = request.cookies.get("admin_token");
  const expected = await getSessionToken();

  if (!cookie || cookie.value !== expected) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
