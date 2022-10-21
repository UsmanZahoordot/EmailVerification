import {Verification}  from "../server/models/verification.js";
export const flushData = async () => {
  let users= await Verification.find({is_valid:true})
  users.map(async (user) => {
    let days=diffDays(new Date(),user.verified_on);
    if(days>15){
       await Verification.deleteOne({_id:user._id})
    }
  });
};
const diffDays = (date, otherDate) => Math.ceil(Math.abs(date - otherDate) / (1000 * 60 * 60 * 24));
