import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import User from "@/lib/models/User";
import AttendanceDAY1 from "@/lib/models/AttendanceDAY1";
import AttendanceDAY2 from "@/lib/models/AttendanceDAY2";
import AttendanceCOMBO from "@/lib/models/AttendanceCOMBO";

const modelMap = {
  users: User,
  attendanceday1s: AttendanceDAY1,
  attendanceday2s: AttendanceDAY2,
  attendancecombos: AttendanceCOMBO,
};

export async function POST(req) {
  await dbConnect();

  const { collection } = await req.json();

  if (!collection || !modelMap[collection]) {
    return NextResponse.json({ message: "Invalid collection name" }, { status: 400 });
  }

  try {
    const result = await modelMap[collection].deleteMany({});
    return NextResponse.json({
      message: `Deleted ${result.deletedCount} documents from ${collection}`,
    });
  } catch (error) {
    console.error("Error deleting collection:", error);
    return NextResponse.json({ message: "Error deleting collection" }, { status: 500 });
  }
}
