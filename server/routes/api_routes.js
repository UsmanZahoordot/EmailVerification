import { Router } from "express";
import { Verification_Controller } from "../controllers/verification_contoller.js";

export const router = Router();
const controller = new Verification_Controller();

router.get("/", (req, res) => {

    controller.klean_api_request(req.body.email);
    res.send(req.body.email);
});
