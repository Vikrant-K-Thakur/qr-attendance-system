import mongoose from "mongoose";

const CertificateSentSchema = new mongoose.Schema({
  email: { type: String, required: true },
  registeredEvent: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
});

// Unique per email + event combination
CertificateSentSchema.index({ email: 1, registeredEvent: 1 }, { unique: true });

export default mongoose.models.CertificateSent ||
  mongoose.model("CertificateSent", CertificateSentSchema);
