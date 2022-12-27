import { Router } from "express";
import {
  VerificationController,
  verify_email_in_db,
  get_all_emails,
  get_all_emails_count,
} from "../controllers/verification_contoller.js";

import {
  addVerificationToUser,
  checkAdmin,
  get_daily_count,
  get_daily,
  getCredits,
  getUserQueries,
  getVerificationByID,
  userSignup,
  getUsers,
  getUsersCount,
  updateUser,
  deleteUser,
  deductCredits,
} from "../controllers/user_controller.js";
import { email_finder_request } from "../controllers/finder_controller.js";

export const router = Router();
const controller = new VerificationController();

router.post("/", async (req, res) => {
  if (req.body.username == undefined) {
    res.send("Username not provided");
    return;
  }

  const allow = deductCredits(req.body.username, req.body.emails.length);
  if (!allow) {
    res.status(500).send("Not enough credits");
    return;
  }

  const filename = req.body.filename;

  Promise.all(req.body.emails.map((email) => verify_email(email))).then(
    (results) => {
      res.send(results);

      if (!filename) {
        return;
      }
      const valid_count = results.filter((result) => result.is_valid).length;
      const invalid_count = results.filter((result) => !result.is_valid).length;
      addVerificationToUser(
        req.body.username,
        filename,
        valid_count,
        invalid_count,
        Date.now(),
        req.body.emails
      );
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

router.post("/signup", async (req, res) => {
  const success = await userSignup(
    req.body.firstName,
    req.body.lastName,
    req.body.username,
    req.body.is_admin,
    req.body.email,
    req.body.credits
  );
  if (success) {
    res.send("Success");
  } else {
    res.send("Failure");
  }
});

router.post("/user-queries", async (req, res) => {
  const queries = await getUserQueries(req.body.username);
  res.send(queries);
});

router.post("/reverify-file", async (req, res) => {
  const emails = await getVerificationByID(
    req.body.username,
    req.body.id,
    req.body.filename,
    req.body.mode
  );
  Promise.all(emails.map((email) => verify_email(email))).then((results) => {
    res.send(results);
  });
});

router.post("/get-all-emails", async (req, res) => {
  res.send(await get_all_emails(req.query.page));
});

router.post("/emails-count", async (req, res) => {
  const value = await get_all_emails_count();
  console.log(value);
  res.send({ count: value });
});

router.post("/users-count", async (req, res) => {
  const value = await getUsersCount();
  console.log(value);
  res.send({ count: value });
});

router.post("/all-users", async (req, res) => {
  res.send(await getUsers(req.query.page));
});

// update user with these arguments "email, firstName, lastName, credits"
router.post("/update-user", async (req, res) => {
  const success = await updateUser(
    req.body.email,
    req.body.firstName,
    req.body.lastName,
    req.body.credits,
    req.body.username
  );
  if (success) {
    res.send("Success");
  } else {
    res.send("Failure");
  }
});

router.post("/delete-user", async (req, res) => {
  const success = await deleteUser(req.body.email);
  if (success) {
    res.send("Success");
  } else {
    res.send("Failure");
  }
});

router.get("/is_admin", async (req, res) => {
  const is_admin = await checkAdmin(req.query.username);
  res.send({
    is_admin: is_admin,
  });
});

router.post("/get_daily_count", async (req, res) => {
  const username = req.body.username;
  const start_date = new Date(req.body.start_date);
  const end_date = new Date(req.body.end_date);

  const daily_count = await get_daily_count(username, start_date, end_date);
  res.send({
    data: daily_count,
  });
});

router.post("/get_daily", async (req, res) => {
  const username = req.body.username;
  const start_date = new Date(req.body.start_date);
  const end_date = new Date(req.body.end_date);
  const page = req.body.page;
  const limit = req.body.limit;
  const daily_count = await get_daily(
    username,
    start_date,
    end_date,
    page,
    limit
  );
  res.send({
    data: daily_count,
  });
});

router.post("/user-credits", async (req, res) => {
  const credits = await getCredits(req.body.user_id);
  console.log(req.body);
  res.send({
    credits: credits,
  });
});
