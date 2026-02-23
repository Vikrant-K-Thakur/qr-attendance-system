import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import User from "@/lib/models/User";
import AttendanceDAY1 from "@/lib/models/AttendanceDAY1";
import AttendanceDAY2 from "@/lib/models/AttendanceDAY2";
import AttendanceCOMBO from "@/lib/models/AttendanceCOMBO";

export async function POST(req) {
  await dbConnect();

  const { userId, eventName } = await req.json();
  
  try {
    // Parse QR data to extract fields
    const lines = userId.split('\n');
    const parsedData = {};
    
    lines.forEach(line => {
      const [key, ...valueParts] = line.split(':');
      if (key && valueParts.length > 0) {
        const value = valueParts.join(':').trim();
        parsedData[key.trim()] = value;
      }
    });
    
    const name = parsedData['Name'];
    const prn = parsedData['PRN'] || null;
    const email = parsedData['Email'];
    const ticketType = parsedData['TicketType'];
    
    // Find user based on whether PRN exists
    let user = null;
    
    if (prn) {
      // VIT Student: Use name + prn + email
      if (name && email) {
        user = await User.findOne({ name, prn, email });
      }
      // Fallback: prn + name
      if (!user && name) {
        user = await User.findOne({ prn, name });
      }
    } else {
      // NON-VIT Student: Use email as primary identifier
      if (email) {
        user = await User.findOne({ email });
      }
    }
    
    // If not found, try with exact id match
    if (!user) {
      user = await User.findOne({ id: userId });
    }
    
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
    
    // Determine attendance model based on ticketType
    let AttendanceModel;
    if (user.ticketType === "DAY1") {
      AttendanceModel = AttendanceDAY1;
    } else if (user.ticketType === "DAY2") {
      AttendanceModel = AttendanceDAY2;
    } else if (user.ticketType === "COMBO") {
      AttendanceModel = AttendanceCOMBO;
    } else {
      AttendanceModel = AttendanceDAY1; // Default fallback
    }

    // Check if attendance is already marked
    const existingAttendance = await AttendanceModel.findOne({
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
    const attendance = await AttendanceModel.create({ 
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
