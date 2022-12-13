import mongoose from "mongoose";

const verificiationQuerySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  filename: {
    type: String,
    required: true,
    minlength: 3,
    maxlength: 50,
  },
  valid_count: {
    type: Number,
    required: true,
  },
  invalid_count: {
    type: Number,
    required: true,
  },
  timestamp: {
    type: Date,
    required: true,
  },
  emails: [
    {
      type: String,
      required: true,
      minlength: 5,
      maxlength: 50,
    },
  ],
});

export const VerificationQuery = mongoose.model(
  "VerificationQuery",
  verificiationQuerySchema
);
