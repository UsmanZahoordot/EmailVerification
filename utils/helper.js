import {Verification}  from "../server/models/verification.js";
export const flushData = async () => {
  const today = new Date(Date.now());
  today.setDate(today.getDate() - 15);
  console.log(today);
  await Verification.deleteMany({
    verified_on: {
      $lte: today,
    },
  });
};