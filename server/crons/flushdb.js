import CronJob from "node-cron";
import {Verification}  from "../models/verification.js";

const diffDays = (date, otherDate) => Math.ceil(Math.abs(date - otherDate) / (1000 * 60 * 60 * 24));

const flushData = async () => {
    let users= await Verification.find({is_valid:true})
    users.map(async (user) => {
      let days=diffDays(new Date(),user.verified_on);
      if(days>15){
         await Verification.deleteOne({_id:user._id})
      }
    });
  };

export const flushDb = () => {
    const scheduledJobFunction = CronJob.schedule("0 0 * * *", () => {
      console.log("I'm executed on a schedule!");
      flushData();
    });
  
    scheduledJobFunction.start();
  }
