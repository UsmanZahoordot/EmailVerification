import mongoose from "mongoose";

const fileSchema = new mongoose.Schema({
  filename: { type: String, required: true },
  user_id: { type: String, required: true },
  date: { type: Date, default: Date.now },
  list_id: { type: String, required: true },
  downloaded_link: { type: String, required: false },
});
export const FileUploader = mongoose.model("FileUploader", fileSchema);
