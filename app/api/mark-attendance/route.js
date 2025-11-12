import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import User from "@/lib/models/User";
import Attendance from "@/lib/models/Attendance";

export async function POST(req) {
  await dbConnect();

  const { userId, eventName } = await req.json();
  
  try {
    // Try to find user with exact match first
    let user = await User.findOne({ id: userId });
    
    // If not found, try with normalized newlines
    if (!user) {
      const normalizedUserId = userId.replace(/\\n/g, '\n');
      user = await User.findOne({ id: normalizedUserId });
    }
    
    // If not found, try reverse normalization
    if (!user) {
      const escapedUserId = userId.replace(/\n/g, '\\n');
      user = await User.findOne({ id: escapedUserId });
    }
    
    // If still not found, try partial match (QR might be truncated)
    if (!user) {
      const escapedForRegex = userId.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      user = await User.findOne({ id: { $regex: `^${escapedForRegex}` } });
    }
    
    if (!user) {
      return NextResponse.json(
        { message: "User not found. Please check if the user is registered." },
        { status: 400 }
      );
    }

    const isUserRegisteredForCurrentEvent = user.registeredEvent.includes(eventName);
    if (!isUserRegisteredForCurrentEvent) {
      return NextResponse.json(
        { message: `User not registered for ${eventName}. Registered for: ${user.registeredEvent.join(', ')}` },
        { status: 400 }
      );
    }
    
    // Check if attendance is already marked
    const existingAttendance = await Attendance.findOne({
      userId: user.id,
      registeredEvent: eventName,
    });
    
    if (existingAttendance) {
      return NextResponse.json(
        { message: "Attendance already marked for this user" },
        { status: 400 }
      );
    }

    // Mark attendance
    const attendance = await Attendance.create({ 
      userId: user.id, 
      registeredEvent: eventName,
      timestamp: new Date()
    });

    return NextResponse.json(
      { 
        message: "Attendance marked successfully", 
        user: user.name,
        event: eventName,
        timestamp: attendance.timestamp
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error marking attendance:", error);
    return NextResponse.json(
      { message: "Error marking attendance" },
      { status: 500 }
    );
  }
}
