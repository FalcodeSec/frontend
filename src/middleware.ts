import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  // For now, allow all requests to dashboard
  // We'll handle authentication on the client side
  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};

