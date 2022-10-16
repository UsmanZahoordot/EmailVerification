import { Router } from "express";
import { Verification } from "../models/verification.js";

export const router = Router();

router.post("/create", async (req, res) => {
  const verification = new Verification({
    email: req.body.email,
    is_valid: req.body.is_valid,
    disposable_status: req.body.disposable_status,
    verified_on: req.body.date,
  });
  try {
    await verification.save();
    res.status(201).json(verification);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.get("/", async (req, res) => {
  const verification = await Verification.find();
  res.json(verification);
});
