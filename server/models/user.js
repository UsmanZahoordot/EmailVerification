import mongoose from "mongoose";


const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
    minlength: 3,
    maxlength: 50,
  },
  lastName: {
    type: String,
    required: true,
    minlength: 3,
    maxlength: 50,
  },
  username: {
    type: String,
    required: true,
    minlength: 3,
    maxlength: 50,
  },
  is_admin: {
    type: Boolean,
    required: true,
  },
  credits: {
    type: Number,
    required: true,
    default: 0,
  },
});

export const User = mongoose.model("User", userSchema);