import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Admin from "@/lib/models/Admin";
import RefreshToken from "@/lib/models/RefreshToken";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;

export async function POST(req) {
  await dbConnect();

  try {
    const refreshToken = req.cookies.get("refreshToken")?.value;

    if (!refreshToken) {
      return NextResponse.json({ message: "No refresh token." }, { status: 401 });
    }

    // Check if refresh token exists in DB (not revoked)
    const stored = await RefreshToken.findOne({ token: refreshToken });
    if (!stored) {
      return NextResponse.json({ message: "Invalid or revoked refresh token." }, { status: 401 });
    }

    // Get admin details
    const admin = await Admin.findById(stored.adminId);
    if (!admin) {
      await RefreshToken.deleteOne({ token: refreshToken });
      return NextResponse.json({ message: "Admin not found." }, { status: 401 });
    }

    // Issue new access token
    const newAccessToken = jwt.sign(
      { id: admin._id, email: admin.email, name: admin.name },
      JWT_SECRET,
      { expiresIn: "15m" }
    );

    const response = NextResponse.json({
      admin: { name: admin.name, email: admin.email },
    });

    response.cookies.set("token", newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 15,
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Refresh error:", error);
    return NextResponse.json({ message: "Server error." }, { status: 500 });
  }
}
