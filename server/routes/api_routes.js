import { Router } from "express";
import { VerificationController, verify_email_in_db } from "../controllers/verification_contoller.js";

export const router = Router();
const controller = new VerificationController();

var request_counts = {
  klean_api: 0,
  clearout_api: 0,
};

var api_limits = {
  klean_api: 2,
  clearout_api: 2,
};

setInterval(() => {
  console.log(request_counts);
  request_counts = {
    klean_api: 0,
    clearout_api: 0,
  };
}, 20000);

router.get("/", async (req, res) => {
  let email = req.query.email;

  const cached_queries = await verify_email_in_db(email);
  console.log(cached_queries);
  if (cached_queries.length > 0) {
    console.log("Found");
    res.send(cached_queries[0]);
  }

  while (
    request_counts["klean_api"] >= api_limits["klean_api"] &&
    request_counts["clearout_api"] >= api_limits["clearout_api"]
  ) {
    await new Promise((r) => setTimeout(r, 10000));
  }

  if (request_counts["klean_api"] < api_limits["klean_api"]) {
    request_counts["klean_api"]++;
    console.log("KLEAN", request_counts);
    controller.klean_api_request(res, email);
  } else {
    request_counts["clearout_api"]++;
    console.log("CLEAR", request_counts);
    controller.clearout_email_verification(res, email);
  }
});
