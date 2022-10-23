import requestModule from "request";
import { Verification } from "../models/verification.js";
import axios from "axios";

export const verify_email_in_db = async (email) => {
  const all = await Verification.find({ email: email });
  return all;
};

export class VerificationController {
  klean_api_request = async (response, email) => {
    var reqBody = {
      record: email,
    };
    reqBody = JSON.stringify(reqBody);
    const options = {
      headers: {  
        api_key: process.env.KLEAN_API_KEY,
        "Content-Type": "application/json",
      }
    };

    return axios.post("https://api.kleanmail.com/record_verification/api_record", reqBody, options);
  };

  clearout_email_verification = async (response, email) => {
    var reqBody = {
      email: email,
    };
    reqBody = JSON.stringify(reqBody);
    const options = {
      headers: {
        Authorization: process.env.CLEAROUT_API_KEY, // Your API KEY
        "Content-Type": "application/json",
      }
    }
    return axios.post("https://api.clearout.io/v2/email_verify/instant", reqBody, options);
  };

  
}
