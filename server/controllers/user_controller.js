import { User } from "../models/user.js";
import { VerificationQuery } from "../models/verification_query.js";

const userSignup = async (firstname, lastname, fullname, is_admin) => {
  const user = new User({
    firstName: firstname,
    lastName: lastname,
    username: fullname,
    is_admin: is_admin,
    credits: 0,
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

const getEmailsByFileID = async (username, id) => {
  const user = await User.findOne({
    username: username,
  });
  if (!user) return [];

  const query = await VerificationQuery.findOne({
    user: user._id,
    date: id,
  });
  return query.emails;
}

export { userSignup, addVerificationToUser, getUserQueries, getEmailsByFileID as getVerificationByID };
