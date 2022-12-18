import { Verification } from "../models/verification.js";
import axios from "axios";
import { stringify } from "querystring";

export const verify_email_in_db = async (email) => {
  const all = await Verification.find({ email: email });
  return all;
};

export const get_all_emails_count = async () => {
  const all = await Verification.countDocuments({});
  console.log("All", all);
  return all;
};

export const get_all_emails = async (page) => {
  const all = await Verification.find({})
    .limit(20)
    .skip((page - 1) * 20);
  // return only emails, date and status
  return all.map((item) => {
    return {
      email: item.email,
      verified_on: item.verified_on,
      is_valid: item.is_valid,
    };
  });
};

export class VerificationController {
  klean_api_request = async (email) => {
    var reqBody = {
      record: email,
    };
    reqBody = JSON.stringify(reqBody);
    const options = {
      headers: {
        api_key: process.env.KLEAN_API_KEY,
        "Content-Type": "application/json",
      },
    };

    return axios
      .post(
        "https://api.kleanmail.com/record_verification/api_record",
        reqBody,
        options
      )
      .then((response) => {
        console.log(response.data);
        const raw_data = response.data;
        const verification = new Verification({
          email: raw_data["record"],
          is_valid: raw_data["is_exist"] ? true : false,
          is_disposable: raw_data["is_disposable"],
          verified_on: new Date(),
        });

        verification.save((err, doc) => {
          if (!err) console.log("success", "User added successfully!");
          else console.log("Error during record insertion : " + err);
        });

        return verification;
      });
  };

  clearout_email_verification = async (email) => {
    var reqBody = {
      email: email,
    };
    reqBody = JSON.stringify(reqBody);
    const options = {
      headers: {
        Authorization: process.env.CLEAROUT_API_KEY, // Your API KEY
        "Content-Type": "application/json",
      },
    };
    return axios
      .post("https://api.clearout.io/v2/email_verify/instant", reqBody, options)
      .then((response) => {
        console.log(response.data);
        const raw_data = response.data;
        const verification = new Verification({
          email: email,
          is_valid: raw_data["data"]["status"] == "valid" || false,
          is_disposable: raw_data["data"]["desposible"] != "no",
          verified_on: new Date(),
        });

        verification.save((err, doc) => {
          if (!err) console.log("success", "User added successfully!");
          else console.log("Error during record insertion : " + err);
        });

        return verification;
      });
  };
}
