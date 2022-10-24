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
    var promises = [];

    for (let i = 0; i < req.body.emails.length; i++) {
      promises.push(verify_email(req.body.emails[i]))
    }

    Promise.all(promises).then((values) => {
      res.send(values);
    });
  
});

const verify_email = async (email) => {

  const cached_queries = await verify_email_in_db(email);
  console.log(cached_queries);
  if (cached_queries.length > 0) {
    console.log("Found");
    // res.send(cached_queries[0]);
    return Promise.resolve(cached_queries[0]);
  }

  while (
    request_counts["klean_api"] >= api_limits["klean_api"] &&
    request_counts["clearout_api"] >= api_limits["clearout_api"]
  ) {
    await new Promise((r) => setTimeout(r, 10000));
  }

  if (request_counts["klean_api"] > api_limits["klean_api"]) {
    request_counts["klean_api"]++;
    console.log("KLEAN", request_counts);

    controller.klean_api_request(res, email).then(response => {
      console.log(response);
      // res.send(response);
      return response;
    })
    .catch(error => {
      console.log(error)
    });

  } 
  else {
    request_counts["clearout_api"]++;
    controller.clearout_email_verification(res, email).then(response => {
      console.log("clear out");
      console.log(response);
      // res.send(response);
      return response;
    });
  }
};

router.get("/email-finder", (req, res) => {
  email_finder_request(res,req.body.name, req.body.domain);
});
