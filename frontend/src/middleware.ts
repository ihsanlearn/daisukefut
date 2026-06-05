import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const ROLE_CONFIG = {
  admin: { home: "/admin", allowed: ["/admin", "/profile"] },
  canteen: { home: "/canteen", allowed: ["/canteen", "/profile", "/delivery"] },
  customer: { home: "/", allowed: ["/", "/customer/profile", "/customer/checkout", "/customer/track", "/customer/orders"] },
} as const;

const PUBLIC_ROUTES = ["/"];
const AUTH_ROUTES = ["/login", "/signup", "/signup/canteen"];
const UNDEFINED_ROUTES = ["/customer"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasSession = request.cookies.has("user_role");
  const rawRole = request.cookies.get("user_role")?.value;
  const role = (rawRole as keyof typeof ROLE_CONFIG) || "customer";

  if (PUBLIC_ROUTES.includes(pathname)) {
    return NextResponse.next();
  }

  if (UNDEFINED_ROUTES.includes(pathname)) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  if (!hasSession) {
    if (AUTH_ROUTES.includes(pathname)) {
      return NextResponse.next();
    }
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const config = ROLE_CONFIG[role] || ROLE_CONFIG["customer"];

  if (AUTH_ROUTES.includes(pathname)) {
    return NextResponse.redirect(new URL(config.home, request.url));
  }

  const isAllowed = config.allowed.some((route) => pathname.startsWith(route));

  if (!isAllowed) {
    if (pathname === config.home) return NextResponse.next();
    return NextResponse.redirect(new URL(config.home, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|sanctum|_next/static|_next/image|favicon.ico|.well-known).*)"],
};