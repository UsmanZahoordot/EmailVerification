import { Router } from "express";
import {
  VerificationController,
  verify_email_in_db,
  get_all_emails,
  get_all_emails_count,
} from "../controllers/verification_contoller.js";

import { File } from "../models/file.js";

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
  getUserQueriesPagination,
  getUserQuery,
  createQuery,
  removeInProgress,
} from "../controllers/user_controller.js";
import { email_finder_request } from "../controllers/finder_controller.js";
import axios from "axios";

export const router = Router();
const controller = new VerificationController();

router.post("/verify", async (req, res) => {
  if (req.body.username == undefined) {
    res.send("Username not provided");
    return;
  }

  const allow = await deductCredits(req.body.username, req.body.emails.length);
  if (!allow) {
    res.status(500).send("Not enough credits");
    return;
  }
  const current_date = Date.now();
  const query_id = await createQuery(
    req.body.username,
    req.body.filename,
    current_date,
    req.body.firebase_key
  );

  res.send({
    status: "in progress",
    key: req.body.firebase_key,
  });

  Promise.all(req.body.emails.map((email) => verify_email(email))).then(
    (results) => {
      const file = new File({
        filename: req.body.filename,
        user_id: req.body.username,
        date: current_date,
        verifications: results,
      });
      file.save();

      const valid_count = results.filter((result) => result.is_valid).length;
      const invalid_count = results.filter((result) => !result.is_valid).length;
      addVerificationToUser(
        query_id,
        req.body.emails,
        valid_count,
        invalid_count
      ).then((_) => {
        removeInProgress(query_id);
        console.log(req.body.firebase_key);
        const url = `https://everify-326212-default-rtdb.asia-southeast1.firebasedatabase.app/${req.body.firebase_key}.json`;
        axios.delete(url);
      });
    }
  );
});

router.post("/", async (req, res) => {
  Promise.all(req.body.emails.map((email) => verify_email(email))).then(
    (results) => {
      res.send(results);
    }
  );
});

router.get("/get-file", async (req, res) => {
  const file = await getUserQuery(
    req.query.username,
    req.query.filename,
    req.query.timestamp
  );

  if (!file) {
    res.status(404).send("File not found");
    return;
  }
  res.send(file);
});

const verify_email = async (email) => {
  const cached_queries = await verify_email_in_db(email);
  if (cached_queries.length > 0) {
    return Promise.resolve(cached_queries[0]);
  }
  return controller.klean_api_request(email);

  // let isResolved = false;
  // let verificationStatus = null;

  // return controller
  //   .klean_api_request(email)
  //   .then((result) => {
  //     if (!isResolved) {
  //       isResolved = true;
  //       verificationStatus = result;
  //     }
  //   })
  //   .catch((err) => {
  //     console.log(err);
  //   });

  // await new Promise((r) => setTimeout(r, 5000));

  // if (isResolved) {
  //   return verificationStatus;
  // }

  // controller
  //   .klean_api_request(email)
  //   .then((result) => {
  //     if (!isResolved) {
  //       isResolved = true;
  //       verificationStatus = result;
  //     }
  //   })
  //   .catch((err) => {
  //     console.log(err);
  //   });

  // await new Promise((r) => setTimeout(r, 5000));
  // if (isResolved) {
  //   return verificationStatus;
  // }

  // return controller
  //   .clearout_email_verification(email)
  //   .then((result) => {
  //     if (!isResolved) {
  //       isResolved = true;
  //       verificationStatus = result;
  //       return result;
  //     }
  //   })
  //   .catch((err) => {
  //     console.log(err);
  //   });
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
  // const queries = await getUserQueries(req.body.username);
  const queries = await getUserQueriesPagination(
    req.body.username,
    req.body.page
  );
  res.send(queries);
});

router.post("/reverify-file", async (req, res) => {
  const mode = req.body.mode;
  const emails = await getVerificationByID(
    req.body.username,
    req.body.id,
    req.body.filename
  );

  // consolelog the file object that has same name as the filename and same username and same id
  const file = await File.findOne({
    filename: req.body.filename,
    user_id: req.body.username,
    date: req.body.id,
  });
  console.log(file);
  res.send(file);
});

router.post("/get-all-emails", async (req, res) => {
  res.send(await get_all_emails(req.query.page));
});

router.post("/emails-count", async (req, res) => {
  const value = await get_all_emails_count();
  res.send({ count: value });
});

router.post("/users-count", async (req, res) => {
  const value = await getUsersCount();
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
  const start_date = new Date(req.body.start_date + " 12:00:00");
  const end_date = new Date(req.body.end_date + " 12:00:00");

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
  res.send({
    credits: credits,
  });
});
