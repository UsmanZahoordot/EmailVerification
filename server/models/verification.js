// TODO
/**
 * email address
 * verified on
 * verification status
 * desposible status
 */
import mongoose from "mongoose";

const verificationSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    minlength: 5,
    maxlength: 50,
  },
  is_valid: {
    type: Boolean,
    required: true,
  },
  verified_on: {
    type: Date,
    required: true,
  },
  disposable_status: {
    type: Boolean,
    required: true,
  },
});

export const Verification = mongoose.model('Verficiation', verificationSchema);
