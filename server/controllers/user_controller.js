import { User } from "../models/user.js";
import { VerificationQuery } from "../models/verification_query.js";

const userSignup = async (firstname, lastname, fullname, is_admin, email, credits) => {
  const user = new User({
    firstName: firstname,
    lastName: lastname,
    username: fullname,
    is_admin: is_admin,
    credits: credits,
    email: email
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
        "firstName": item.firstName,
        "lastName": item.lastName,
        "credits": item.credits,
        "email": item.email,
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



export { userSignup, addVerificationToUser, getUserQueries, getEmailsByFileID as getVerificationByID, getUsers, getUsersCount, updateUser, deleteUser};
