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

export { userSignup, addVerificationToUser };
