import { User } from "../models/user.js";
import { VerificationQuery } from "../models/verification_query.js";

const userSignup = async (firstname, lastname, fullname) => {
  const user = new User({
    firstName: firstname,
    lastName: lastname,
    username: fullname,
    credits: 0,
  });

  const result = await user.save();
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

  const verificationQuery = new VerificationQuery({
    user: user._id,
    filename: filename,
    valid_count: valid_count,
    invalid_count: invalid_count,
    timestamp: timestamp,
    emails: emails,
  });
};

export { userSignup, addVerificationToUser };
