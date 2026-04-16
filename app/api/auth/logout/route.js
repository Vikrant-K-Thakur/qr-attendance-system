import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import RefreshToken from "@/lib/models/RefreshToken";

export async function POST(req) {
  await dbConnect();

  try {
    const refreshToken = req.cookies.get("refreshToken")?.value;

    // Delete refresh token from DB (revoke session)
    if (refreshToken) {
      await RefreshToken.deleteOne({ token: refreshToken });
    }

    const response = NextResponse.json({ message: "Logged out successfully" });

    // Clear both cookies
    response.cookies.set("token", "", { httpOnly: true, maxAge: 0, path: "/" });
    response.cookies.set("refreshToken", "", { httpOnly: true, maxAge: 0, path: "/" });

    return response;
  } catch (error) {
    console.error("Logout error:", error);
    // Still clear cookies even if DB delete fails
    const response = NextResponse.json({ message: "Logged out" });
    response.cookies.set("token", "", { httpOnly: true, maxAge: 0, path: "/" });
    response.cookies.set("refreshToken", "", { httpOnly: true, maxAge: 0, path: "/" });
    return response;
  }
}
