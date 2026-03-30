import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import User from "@/lib/models/User";
import AttendanceDAY1 from "@/lib/models/AttendanceDAY1";
import AttendanceDAY2 from "@/lib/models/AttendanceDAY2";
import AttendanceCOMBO from "@/lib/models/AttendanceCOMBO";

export async function GET(req) {
  await dbConnect();

  try {
    const { searchParams } = new URL(req.url);
    const ticketType = searchParams.get("ticketType") || "ALL";
    const event = searchParams.get("event") || "ALL";

    // Fetch from all collections
    const [day1, day2, combo] = await Promise.all([
      AttendanceDAY1.find({}).lean(),
      AttendanceDAY2.find({}).lean(),
      AttendanceCOMBO.find({}).lean(),
    ]);

    // Tag each record with ticketType
    const all = [
      ...day1.map((r) => ({ ...r, ticketType: "DAY1" })),
      ...day2.map((r) => ({ ...r, ticketType: "DAY2" })),
      ...combo.map((r) => ({ ...r, ticketType: "COMBO" })),
    ];

    // Fetch all users once for efficient lookup
    const allUsers = await User.find({}).lean();

    // Enrich each attendance record with user details
    const enriched = all.map((record) => {
      // Try to find user by id field first
      let user = allUsers.find((u) => u.id === record.userId);

      // If not found, try parsing email from userId (QR string) and match by email
      if (!user) {
        const lines = record.userId?.split("\n") || [];
        const parsedData = {};
        lines.forEach((line) => {
          const [key, ...valueParts] = line.split(":");
          if (key && valueParts.length > 0) {
            parsedData[key.trim()] = valueParts.join(":").trim();
          }
        });
        const emailFromQR = parsedData["Email"]?.trim().toLowerCase();
        if (emailFromQR) {
          user = allUsers.find((u) => u.email === emailFromQR);
        }
      }

      return {
        name: user?.name || "Unknown",
        email: user?.email || "-",
        prn: user?.prn || "-",
        ticketType: record.ticketType,
        registeredEvent: record.registeredEvent,
        timestamp: record.timestamp,
      };
    });

    // Counts always from full unfiltered enriched list
    const counts = {
      DAY1: enriched.filter((r) => r.ticketType === "DAY1").length,
      DAY2: enriched.filter((r) => r.ticketType === "DAY2").length,
      COMBO: enriched.filter((r) => r.ticketType === "COMBO").length,
    };

    // Apply filters
    let filtered = enriched;
    if (ticketType !== "ALL") {
      filtered = filtered.filter((r) => r.ticketType === ticketType);
    }
    if (event !== "ALL") {
      filtered = filtered.filter((r) => r.registeredEvent === event);
    }

    // Sort by latest first
    filtered.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    return NextResponse.json({
      total: filtered.length,
      counts,
      records: filtered,
    });
  } catch (error) {
    console.error("Error fetching attendance:", error);
    return NextResponse.json({ message: "Error fetching attendance" }, { status: 500 });
  }
}
