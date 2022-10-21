import requestModule from "request";
import { Verification } from "../models/verification.js";

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
    requestModule.post(
      {
        url: "https://api.kleanmail.com/record_verification/api_record",
        body: reqBody,
        headers: {  
          api_key: process.env.KLEAN_API_KEY,
          "Content-Type": "application/json",
        },
      },
      "post.bin",
      function (err, res) {
        if (err) {
          response.send("Error!");
          return;
        }

        console.log(res.body);
        const raw_data = JSON.parse(res.body);
        const verification = new Verification({
          email: email,
          is_valid: raw_data["is_exist"],
          disposable_status: raw_data["is_disposable"],
          verified_on: new Date(),
        });
        verification.save((err, doc) => {
          if (!err) console.log("success", "User added successfully!");
          else console.log("Error during record insertion : " + err);
        });
        response.send(verification);
        return;
      }
    );
  };

  clearout_email_verification = async (response, email) => {
    var reqBody = {
      email: email,
    };
    reqBody = JSON.stringify(reqBody);
    requestModule.post(
      {
        url: "https://api.clearout.io/v2/email_verify/instant",
        body: reqBody,
        headers: {
          Authorization: process.env.CLEAROUT_API_KEY, // Your API KEY
          "Content-Type": "application/json",
        },
      },
      "post.bin",
      function (err, res) {
        if (err) {
          console.error(err);
          response.send("Error!");
          return;
        }

        const raw_data = JSON.parse(res.body);
        if (raw_data["status"] == "success") {
          const verification = new Verification({
            email: email,
            is_valid: raw_data["data"]["status"] == "valid" || false,
            disposable_status: raw_data["data"]["desposible"] != "no",
            verified_on: new Date(),
          });
          verification.save((err, doc) => {
            if (!err) console.log("success", "User added successfully!");
            else console.log("Error during record insertion : " + err);
          });
          response.send(verification);
          return;
        }
      }
    );
  };
}
