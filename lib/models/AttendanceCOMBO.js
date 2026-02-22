import mongoose from "mongoose";
const AttendanceCOMBOSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  registeredEvent: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
});

export default mongoose.models.AttendanceCOMBO ||
  mongoose.model("AttendanceCOMBO", AttendanceCOMBOSchema);
