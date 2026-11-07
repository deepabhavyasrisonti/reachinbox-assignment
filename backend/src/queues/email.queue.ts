
import { Queue } from "bullmq";
import { redisConnection } from "../config/redis";

export const emailQueue = new Queue("email-queue", {
  connection: redisConnection
});

export interface EmailJobData {
  emailId: string;
  recipient: string;
  subject: string;
  body: string;
  senderId: string;
}

export async function addEmailJob(
  data: EmailJobData,
  scheduledAt: Date
) {
  const delay = Math.max(0, scheduledAt.getTime() - Date.now());

  return emailQueue.add("send-email", data, {
    jobId: data.emailId,
    delay,
    attempts: 1,
    removeOnComplete: false,
    removeOnFail: false
  });
}
