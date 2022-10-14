import { Router } from "express";
import { Verification } from "../models/verification.js";
import { Verification_Controller } from "../controllers/verification_contoller.js";

export const router = Router();
const controller = new Verification_Controller();

router.get("/", (req, res) => {
//   const verification = new Verification({
//     email: req.body.email,
//     is_valid: false,
//     disposable_status: false,
//     verified_on: new Date(),
//   });
    controller.klean_api_request(req.body.email);
    // res.send(verification);
    res.send(req.body.email);
});
