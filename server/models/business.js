import mongoose from "mongoose";

const fileSchema = new mongoose.Schema({
  first_name: { type: String, required: true },
  last_name: { type: String, required: true },
  mid_name: { type: String, required: false },
  domain: { type: String, required: true },
  is_found: { type: Boolean, required: true },
  email: { type: String, required: false },
});
export const Business = mongoose.model("Business", fileSchema);