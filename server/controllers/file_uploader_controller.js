import axios from "axios";
import { FileUploader } from "../models/fileuploader.js";
import {URL} from 'url';
import { BusinessVerification } from "../models/business_verification.js";
import { Business } from "../models/business.js";

async function processFile(file){
    // send request to link
    // process file which is in csv format
    // save to database
    console.log("file.downloaded_link", file)
    const config = {
      method: 'get',
      url: file.downloaded_link,
      headers: {
        "Content-Type": "application/json",
      }
    };

    await axios(config)
    .then(function (response) {
        var business_verifications = [];
        console.log(response.data);
        const data = response.data;
        var lines = response.data.split('\n');
        // ignore first line
        lines.shift();

        lines = lines.filter((line) => {
          return line !== "";
        })
        .map((line) => {
          return line.split(',');
        });

        
        lines.forEach(async (row) => {
          console.log("row", row);
          console.log(row[0], row[1], row[2], row[12], row[9]);
          const business = new Business({
            first_name: row[0],
            mid_name: row[1],
            last_name: row[2],
            domain: row[3],
            is_found: row[12] === "Found",
            email: row[9],
          });
          business_verifications.push(business);
          
        });

        const businessVerification = new BusinessVerification({
          filename: file.filename,
          user_id: file.user_id,
          date: file.date,
          list_id: file.list_id,
          business_verification: business_verifications,
        });
        businessVerification.save((err, businessVerification) => {
          if (err) {
            console.log(err);
            return ("Wrong list id provided");
          } else {
            console.log("File saved");
            
            return;
          }
        }
        );
    })
    .catch(function (error) {
      console.log(error);
    }
    );

}


export async function processIncompleteFiles(files) {
  const requests = files.map(async (file) => {
    const apiUrl = new URL('https://api.clearout.io/v2/email_finder/download/result'); // Dynamic URL for production
    try {
      const data = JSON.stringify({ 
        "list_id": file.list_id 
      });
      const config = {
        method: 'post',
        url: apiUrl,
        headers: {
          "Content-Type": "application/json",
          "Authorization": process.env.CLEAROUT_API_KEY,
        },
        data: data,
      };

      axios(config)
      .then(function (response) {
        if (response.data.status !== "success") {
          console.log("Not yet Completed");
          return;
        }
        file.downloaded_link = response.data.data.url;
        console.log("file", file);
        FileUploader.updateOne({list_id: file.list_id}, {downloaded_link: response.data.data.url}, async (err, fi) => {
          if (err) {
            console.log(err);
            return ("Wrong list id provided");
          } else {
            await processFile(file);
            console.log("File updated");
          }});

      })
      .catch(function (error) {
        console.log(error);
      });
    } catch (error) {
      console.log(error);
    }

  });

  return await Promise.all(requests);
}

