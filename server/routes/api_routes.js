import { Router } from "express";
import {
  VerificationController,
  verify_email_in_db,
} from "../controllers/verification_contoller.js";
import { email_finder_request } from "../controllers/finder_controller.js";


export const router = Router();
const controller = new VerificationController();

var default_req = "clearout"

router.post("/", async (req, res) => {
  Promise.all(req.body.emails.map((email) => verify_email(email))).then(
    (results) => {
      res.send(results);
    }
  );
});

const verify_email = async (email) => {
  const cached_queries = await verify_email_in_db(email);
  console.log(cached_queries);
  if (cached_queries.length > 0) {
    console.log("Found");
    return Promise.resolve(cached_queries[0]);
  }

  if (default_req == "clearout"){
    return controller
    .clearout_email_verification(email)
    .then((result) => {
      console.log("clearout_email_verification");
      return result
    })
    .catch((err) => {
      console.log(err);
    });
  }

  let isResolved = false;
  let verificationStatus = null;

  controller
    .klean_api_request(email)
    .then((result) => {
      if (!isResolved) {
        isResolved = true;
        verificationStatus = result;
      }
    })
    .catch((err) => {
      console.log(err);
    });

  await new Promise((r) => setTimeout(r, 5000));

  if (isResolved) {
    return verificationStatus;
  }

  controller
    .klean_api_request(email)
    .then((result) => {
      if (!isResolved) {
        isResolved = true;
        verificationStatus = result;
      }
    })
    .catch((err) => {
      console.log(err);
    });

  await new Promise((r) => setTimeout(r, 5000));
  if (isResolved) {
    return verificationStatus;
  }

  return controller
    .clearout_email_verification(email)
    .then((result) => {
      if (!isResolved) {
        isResolved = true;
        verificationStatus = result;
        return result;
      }
    })
    .catch((err) => {
      console.log(err);
    });
};

router.post("/email-finder", (req, res) => {
  email_finder_request(res, req.body.name, req.body.domain);
});