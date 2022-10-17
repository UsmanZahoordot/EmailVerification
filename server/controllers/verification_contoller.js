import http from "http";
import requestModule from "request";
import querystring from "querystring";
import { Verification } from "../models/verification.js";

const verify_email_in_db = async (email) => {
  const all = await Verification.find({ email: email });
  return all;
};

export class Verification_Controller {
  klean_api_request = async (email) => {
    const is_present = await verify_email_in_db(email);
    console.log(is_present);
    if (is_present.length > 0) {
      console.log("Found");
    } else {
      var reqBody = {
        record: email,
      };
      reqBody = JSON.stringify(reqBody);
      requestModule.post(
        {
          url: "https://api.kleanmail.com/record_verification/api_record",
          body: reqBody,
          headers: {
            api_key:
              "api_key::_p3Uph0tJv2vImXR%2BaNJ5GSiVqz2Ne0zCookA3tqZMK0%3D", // Your API KEY
            "Content-Type": "application/json",
          },
        },
        "post.bin",
        function (err, res) {
          if (err) {
            console.error(err);
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
          console.log(verification);
        }
      );
    }
  };

  clearout_email_verification = async (email) => {
    const is_present = await verify_email_in_db(email);
    console.log(is_present);
    if (is_present.length > 0) {
      console.log("Found");
    } else {
      console.log("Not found");

      var reqBody = {
        email: email,
      };
      reqBody = JSON.stringify(reqBody);
      requestModule.post(
        {
          url: "https://api.clearout.io/v2/email_verify/instant",
          body: reqBody,
          headers: {
            Authorization:
              "4f7ffafafa447cdef751ffb037c91a8a:57ecb252d2f92600ca1132308a0ce486aac7a379cd7dc819af804145e98d7682", // Your API KEY
            "Content-Type": "application/json",
          },
        },
        "post.bin",
        function (err, res) {
          if (err) {
            console.error(err);
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
            console.log(verification);
          }
        }
      );
    }
  };
}
