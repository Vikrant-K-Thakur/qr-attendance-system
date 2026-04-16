import mongoose from "mongoose";

const RefreshTokenSchema = new mongoose.Schema({
  adminId: { type: mongoose.Schema.Types.ObjectId, ref: "Admin", required: true },
  token: { type: String, required: true, unique: true },
  createdAt: { type: Date, default: Date.now, expires: 60 * 60 * 24 * 7 }, // auto-delete after 7 days
});

export default mongoose.models.RefreshToken || mongoose.model("RefreshToken", RefreshTokenSchema);
