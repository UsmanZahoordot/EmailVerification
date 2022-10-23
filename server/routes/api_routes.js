import { Router } from "express";
import { VerificationController, verify_email_in_db } from "../controllers/verification_contoller.js";
import { email_finder_request } from "../controllers/finder_controller.js";
import { Verification } from "../models/verification.js";

export const router = Router();
const controller = new VerificationController();

var request_counts = {
  klean_api: 0,
  clearout_api: 0,
};

var api_limits = {
  klean_api: 50,
  clearout_api: 500,
};

setInterval(() => {
  console.log(request_counts);
  request_counts = {
    klean_api: 0,
    clearout_api: 0,
  };
}, 10000);

router.get("/", async (req, res) => {
  let email = req.query.email;

  const cached_queries = await verify_email_in_db(email);
  console.log(cached_queries);
  if (cached_queries.length > 0) {
    console.log("Found");
    res.send(cached_queries[0]);
    return;
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

    controller.klean_api_request(res, email).then(response => {
      console.log(response.data);
      const raw_data = response.data;
      const verification = new Verification({
        email: raw_data['record'],
        is_valid: raw_data["is_exist"],
        is_disposable: raw_data["is_disposable"],
        verified_on: new Date(),
      });
      console.log(verification);
      return;
    })
    .catch(error => {
      console.log(error)
    });

  } 
  else {
    request_counts["clearout_api"]++;
    controller.clearout_email_verification(res, email).then(response => {
      console.log("clear out");
      const raw_data = response.data;
      const verification = new Verification({
        email: email,
        is_valid: raw_data["data"]["status"] == "valid" || false,
        is_disposable: raw_data["data"]["desposible"] != "no",
        verified_on: new Date(),
      });
      console.log(verification);
      return;
    });
  }
});

router.get("/email-finder", (req, res) => {
  email_finder_request(res,req.body.name, req.body.domain);
});
