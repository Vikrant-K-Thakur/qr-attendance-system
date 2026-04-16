import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Admin from "@/lib/models/Admin";
import RefreshToken from "@/lib/models/RefreshToken";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";

const JWT_SECRET = process.env.JWT_SECRET;

export async function POST(req) {
  await dbConnect();

  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ message: "Email and password are required." }, { status: 400 });
    }

    const admin = await Admin.findOne({ email: email.toLowerCase().trim() });
    if (!admin) {
      return NextResponse.json({ message: "Invalid email or password." }, { status: 401 });
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return NextResponse.json({ message: "Invalid email or password." }, { status: 401 });
    }

    // Short-lived access token (15 minutes)
    const accessToken = jwt.sign(
      { id: admin._id, email: admin.email, name: admin.name },
      JWT_SECRET,
      { expiresIn: "15m" }
    );

    // Long-lived refresh token (random, stored in DB)
    const refreshToken = crypto.randomBytes(64).toString("hex");
    await RefreshToken.create({ adminId: admin._id, token: refreshToken });

    const response = NextResponse.json({
      message: "Login successful",
      admin: { name: admin.name, email: admin.email },
    });

    const isProd = process.env.NODE_ENV === "production";

    // Access token cookie — 15 minutes
    response.cookies.set("token", accessToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: "lax",
      maxAge: 60 * 15,
      path: "/",
    });

    // Refresh token cookie — 7 days
    response.cookies.set("refreshToken", refreshToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json({ message: "Server error." }, { status: 500 });
  }
}
