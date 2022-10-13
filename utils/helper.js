import {Verification}  from "../server/models/verification.js";
export const getDays = async () => {
  const today = new Date(Date.now());
  await Verification.deleteMany({
    verified_on: {
      $gte: today,
    },
  });
};
