import { Router } from "express";
import { Verification } from "../models/verification.js";

export const router = Router();

router.get("/", (req, res) => {
  const verification = new Verification({
    email: req.body.email,
    is_valid: false,
    disposable_status: false,
    verified_on: new Date(),
  });
  res.json(verification);
});
