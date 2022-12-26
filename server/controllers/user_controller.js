import { User } from "../models/user.js";
import { VerificationQuery } from "../models/verification_query.js";
import { Verification } from "../models/verification.js";
import mongoose from "mongoose";

const userSignup = async (
  firstname,
  lastname,
  fullname,
  is_admin,
  email,
  credits
) => {
  const user = new User({
    firstName: firstname,
    lastName: lastname,
    username: fullname,
    is_admin: is_admin,
    credits: credits,
    email: email,
  });

  const result = await user.save();
  if (!result) return false;
  return true;
};

const addVerificationToUser = async (
  username,
  filename,
  valid_count,
  invalid_count,
  timestamp,
  emails
) => {
  const user = await User.findOne({
    username: username,
  });
  if (!user) return false;

  const verificationQuery = new VerificationQuery({
    user: user._id,
    filename: filename,
    valid_count: valid_count,
    invalid_count: invalid_count,
    timestamp: timestamp,
    emails: emails,
  });
  verificationQuery.save();
  return true;
};

const getUserQueries = async (username) => {
  const user = await User.findOne({
    username: username,
  });
  if (!user) {
    console.log("asd");
    return [];
  }

  const queries = await VerificationQuery.find({
    user: user._id,
  });
  return queries;
};

const getEmailsByFileID = async (username, id, filename, mode) => {
  const user = await User.findOne({
    username: username,
  });
  if (!user) return [];

  const query = await VerificationQuery.findOne({
    user: user._id,
    date: id,
    filename: filename,
  });
  return query.emails.filter(
    (email) =>
      (mode === "all") ||
      (mode === "valid" && email.valid) ||
      (mode === "invalid" && !email.valid) ||
      (mode === "disposable" && email.disposable)
  );
};

const getUsersCount = async () => {
  const count = await User.countDocuments();
  return count;
};

// get all user in pagination with 10 users per page
const getUsers = async (page) => {
  const users = await User.find()
    .skip((page - 1) * 10)
    .limit(10);
  return users.map((item) => {
    return {
      firstName: item.firstName,
      lastName: item.lastName,
      credits: item.credits,
      email: item.email,
    };
  });
};

// find user on email and update the details provided in arguments

const updateUser = async (email, firstName, lastName, credits) => {
  const user = await User.findOne({
    email: email,
  });
  if (!user) return false;

  user.firstName = firstName;
  user.lastName = lastName;
  user.credits = credits;

  const result = await user.save();
  if (!result) return false;
  return true;
};

// find user on email and delete
const deleteUser = async (email) => {
  const user = await User.findOne({
    email: email,
  });
  if (!user) return false;

  const result = await user.delete();
  if (!result) return false;
  return true;
};

const checkAdmin = async (username) => {
  const user = await User.findOne({
    username: username,
  });
  if (!user) return false;
  console.log("user=", user.is_admin);
  return user.is_admin;
};

/*
const verificationSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    minlength: 5,
    maxlength: 50,
  },
  is_valid: {
    type: Boolean,
    required: true,
  },
  verified_on: {
    type: Date,
    required: true,
  },
  is_disposable: {
    type: Boolean,
    required: true,
  },
});
* */
const get_daily_count = async (username, start_date, end_date) => {
  let counts_aggregate = VerificationQuery.aggregate([]);
  if (username != undefined) {
    counts_aggregate = counts_aggregate.match({
      user: mongoose.Types.ObjectId(username),
    });
  }

  const counts = await counts_aggregate
    .match({
      timestamp: {
        $gte: start_date,
        $lte: end_date,
      },
    })
    .group({
      _id: { $dateToString: { format: "%Y-%m-%d", date: "$timestamp" } },
      total: { $sum: { $add: ["$valid_count", "$invalid_count"] } },
      count: { $sum: 1 },
    })
    .project({
      timestamp: 1,
      total: 1,
      count: 1,
    })
    .sort({ _id: 1 });

  const getDates = (d1, d2) => {
    var oneDay = 24 * 3600 * 1000;
    for (var d = [], ms = d1 * 1, last = d2 * 1; ms < last; ms += oneDay) {
      d.push(new Date(ms));
    }
    return d;
  };

  let countsDict = {};
  counts.forEach((item) => {
    countsDict[item._id] = item;
  });

  let dates = getDates(start_date, end_date);
  return dates.map((item) => ({
    _id: item.toISOString().slice(0, 10),
    total: (countsDict[item.toISOString().slice(0, 10)] || {})["total"] || 0,
    count: (countsDict[item.toISOString().slice(0, 10)] || {})["count"] || 0,
  }));
};

const get_daily = async (username, start_date, end_date, page, limit) => {
  let counts_aggregate = Verification.aggregate([]);

  if (username != undefined) {
    counts_aggregate = counts_aggregate.match({
      user: mongoose.Types.ObjectId(username),
    });
  }
  let count = 0;
  await Verification.aggregate([
    {
      $match: {
        verified_on: {
          $gte: start_date,
          $lte: end_date,
        },
      },
    },
    {
      $count: "count",
    },
  ]).then((result) => {
    if (result.length != 0) {
      count = result[0].count;
    }
  });

  console.log("start date", start_date);
  console.log("end date", end_date);
  console.log("page", page);

  const data = await Verification.find({
    verified_on: {
      $gte: start_date,
      $lte: end_date,
    },
  })
    .limit(limit)
    .skip((page - 1) * 10);

  return { data: data, count: count, page: page };
};

const deductCredits = async (username, credits) => {
  const user = await User.findOne({
    username: username,
  });
  if (!user) return false;

  if (user.credits - credits < 0) {
    return false;
  }
  user.credits = user.credits - credits;
  const result = await user.save();
  if (!result) return false;
  return true;
};

export {
  userSignup,
  addVerificationToUser,
  checkAdmin,
  get_daily_count,
  get_daily,
  getUserQueries,
  getEmailsByFileID as getVerificationByID,
  getUsers,
  getUsersCount,
  updateUser,
  deleteUser,
  deductCredits,
};
