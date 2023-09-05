import mongoose from "mongoose";
import { Business } from "./business.js";

const fileSchema = new mongoose.Schema({
  filename: { type: String, required: true },
  user_id: { type: String, required: true },
  date: { type: Date, default: Date.now },
  list_id: { type: String, required: true },
  business_verification: [Business.schema],
});

export const BusinessVerification = mongoose.model("BusinessVerification", fileSchema);
