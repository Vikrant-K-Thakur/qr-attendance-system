import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import User from "@/lib/models/User";

export async function POST(req) {
  await dbConnect();

  const { id, name, prn, email, ticketType, registeredEvent } = await req.json();

  try {
    const user = await User.create({ id, name, prn, email, ticketType, registeredEvent });
    return NextResponse.json({ message: "User added successfully", user });
  } catch (error) {
    console.error("Error adding user:", error);
    return NextResponse.json({ message: "Error adding user" }, { status: 500 });
  }
}