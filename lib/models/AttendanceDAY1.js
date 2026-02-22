import mongoose from "mongoose";
const AttendanceDAY1Schema = new mongoose.Schema({
  userId: { type: String, required: true },
  registeredEvent: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
});

export default mongoose.models.AttendanceDAY1 ||
  mongoose.model("AttendanceDAY1", AttendanceDAY1Schema);
