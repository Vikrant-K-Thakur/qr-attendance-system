import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Admin from "@/lib/models/Admin";
import bcrypt from "bcryptjs";

// POST /api/auth/seed
// Body: { name, email, password, seedKey }
// seedKey must match SEED_KEY in .env to prevent unauthorized use

export async function POST(req) {
  await dbConnect();

  try {
    const { name, email, password, seedKey } = await req.json();

    if (seedKey !== process.env.SEED_KEY) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    if (!name || !email || !password) {
      return NextResponse.json({ message: "Name, email and password are required." }, { status: 400 });
    }

    const existing = await Admin.findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      return NextResponse.json({ message: "Admin with this email already exists." }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const admin = await Admin.create({
      name,
      email: email.toLowerCase().trim(),
      password: hashedPassword,
    });

    return NextResponse.json({
      message: `Admin "${admin.name}" created successfully.`,
      email: admin.email,
    });
  } catch (error) {
    console.error("Seed error:", error);
    return NextResponse.json({ message: "Server error." }, { status: 500 });
  }
}
