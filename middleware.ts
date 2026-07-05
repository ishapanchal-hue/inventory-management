// middleware.ts — replace entire file

import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

const PROTECTED_ROUTES = ["/dashboard"]
const AUTH_ROUTES      = ["/login"]

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Check both cookie (local dev) and a custom header token flag
  const cookieToken = request.cookies.get("access_token")?.value
  // For localStorage-based auth, we use a lightweight session cookie
  // set by the frontend just for middleware routing purposes
  const sessionFlag = request.cookies.get("logiflow_session")?.value

  const hasAuth = !!(cookieToken || sessionFlag)

  const isProtected = PROTECTED_ROUTES.some((route) => pathname.startsWith(route))
  const isAuthRoute  = AUTH_ROUTES.some((route) => pathname.startsWith(route))

  if (isProtected && !hasAuth) {
    const loginUrl = new URL("/login", request.url)
    loginUrl.searchParams.set("from", pathname)
    return NextResponse.redirect(loginUrl)
  }

  if (isAuthRoute && hasAuth) {
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api/).*)"],
}