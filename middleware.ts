// middleware.ts  (project root — same level as package.json)

import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

const PROTECTED_ROUTES = ["/dashboard"]
const AUTH_ROUTES      = ["/login"]

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Read the httpOnly auth cookie
  const token = request.cookies.get("access_token")?.value

  const isProtected = PROTECTED_ROUTES.some((route) => pathname.startsWith(route))
  const isAuthRoute  = AUTH_ROUTES.some((route) => pathname.startsWith(route))

  // No token + trying to access protected route → send to login
  if (isProtected && !token) {
    const loginUrl = new URL("/login", request.url)
    loginUrl.searchParams.set("from", pathname)   // preserve intended destination
    return NextResponse.redirect(loginUrl)
  }

  // Has token + trying to access login → send to dashboard
  if (isAuthRoute && token) {
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  return NextResponse.next()
}

export const config = {
  /*
   * Match all routes EXCEPT:
   * - _next/static  (static files)
   * - _next/image   (image optimization)
   * - favicon.ico
   * - api routes
   */
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api/).*)"],
}