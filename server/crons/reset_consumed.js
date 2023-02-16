import CronJob from "node-cron";
import { User } from "../models/user.js";

const resetConsumedCredits = async () => {
  try {
    await User.updateMany({}, { $set: { consumed_credits: 0 } });
  } catch (error) {
    console.error(error);
  }
};

export const resetConsumedCreditsJob = () => {
  console.log("checking for reset");
  const scheduledJob = CronJob.schedule("0 0 1 * *", () => {
    console.log("Resetting consumed credits...");
    resetConsumedCredits();
  });

  scheduledJob.start();
};
