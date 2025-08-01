import { NextResponse } from "next/server";
import { jwtVerify } from "jose";

export async function middleware(request) {
    const path = request.nextUrl.pathname;
    const token = request.cookies.get("token")?.value || "";

    const isPublicPath =
        path === "/" ||
        path === "/auth/login" ||
        path === "/auth/signup" ||
        path === "/auth/verifyemail";

    const isAdminPath = path.startsWith("/admin");


    let decoded = null;
    if (token) {
        try {
            const secret = new TextEncoder().encode(process.env.TOKEN_SECRET);
            const { payload } = await jwtVerify(token, secret);
            decoded = payload;
        } catch (err) {
            console.error("Invalid token:", err);
            return NextResponse.redirect(new URL("/auth/login", request.url));
        }
    }

    // Redirect logged-in users away from public pages
    if (isPublicPath && decoded) {
        if (decoded.role === "admin") {
            return NextResponse.redirect(new URL("/admin", request.url));
        } else {
            return NextResponse.redirect(new URL("/dashboard", request.url));
        }
    }

    // Redirect unauthenticated users from protected pages
    if (!isPublicPath && !decoded) {
        return NextResponse.redirect(new URL("/auth/login", request.url));
    }

    // Protect admin routes
    if (isAdminPath && decoded?.role !== "admin") {
        return NextResponse.redirect(new URL("/unauthorized", request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        "/",
        "/auth/login",
        "/auth/signup",
        "/auth/verifyemail",
        "/dashboard/:path*",
        "/admin/:path*",
    ],
};
