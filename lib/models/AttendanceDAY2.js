import mongoose from "mongoose";
const AttendanceDAY2Schema = new mongoose.Schema({
  userId: { type: String, required: true },
  registeredEvent: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
});

export default mongoose.models.AttendanceDAY2 ||
  mongoose.model("AttendanceDAY2", AttendanceDAY2Schema);
