import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const ADMIN_ROUTE_PREFIX = "/admin";

export async function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // Protect admin routes and hide them from non-admins (return 404 instead of 401/403)
  if (path.startsWith(ADMIN_ROUTE_PREFIX)) {
    const token = request.cookies.get("qolhub_session")?.value;
    
    if (!token) {
      return new NextResponse(null, { status: 404 }); // Return 404 to hide the route
    }

    try {
      const secret = new TextEncoder().encode(
        process.env.JWT_SECRET || "dev-secret-beddel"
      );
      const { payload } = await jwtVerify(token, secret);
      
      if (payload.role !== "admin") {
        return new NextResponse(null, { status: 404 }); // Return 404 to hide the route
      }
    } catch (err) {
      return new NextResponse(null, { status: 404 }); // Return 404 to hide the route
    }
    
    // If we reach here, user is authenticated admin - allow access
    return NextResponse.next();
  }

  // Rate limiting stub for auth endpoints (can be expanded later)
  if (path.startsWith("/api/auth")) {
    const res = NextResponse.next();
    res.headers.set("X-RateLimit-Limit", "5");
    return res;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/auth/:path*"],
};
