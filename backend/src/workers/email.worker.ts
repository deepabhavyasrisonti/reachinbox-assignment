
import dotenv from "dotenv";
dotenv.config();

import { Worker } from "bullmq";
import nodemailer from "nodemailer";
import { redisConnection } from "../config/redis";
import { prisma } from "../config/database";

const concurrency = Number(process.env.WORKER_CONCURRENCY || 2);

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT || 587),
  secure: Number(process.env.SMTP_PORT || 587) === 465,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

const worker = new Worker(
  "email-queue",
  async (job) => {
    const { emailId, recipient, subject, body } = job.data;

    const email = await prisma.email.findUnique({
      where: { id: emailId }
    });

    if (!email) {
      throw new Error("Email record not found");
    }

    // Prevent processing an already completed email.
    if (email.status === "SENT") {
      return { message: "Email already sent" };
    }

    await prisma.email.update({
      where: { id: emailId },
      data: { status: "PROCESSING" }
    });

    try {
      const info = await transporter.sendMail({
        from: process.env.EMAIL_FROM,
        to: recipient,
        subject,
        text: body
      });

      console.log("Email sent:", info.messageId);

      await prisma.email.update({
        where: { id: emailId },
        data: {
          status: "SENT",
          sentAt: new Date(),
          errorMessage: null
        }
      });

      console.log("Preview URL:", nodemailer.getTestMessageUrl(info));

      return {
        success: true,
        emailId
      };
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Email sending failed";

      await prisma.email.update({
        where: { id: emailId },
        data: {
          status: "FAILED",
          errorMessage: message
        }
      });

      throw error;
    }
  },
  {
    connection: redisConnection,
    concurrency
  }
);

worker.on("completed", (job) => {
  console.log(`Job ${job.id} completed`);
});

worker.on("failed", (job, error) => {
  console.error(`Job ${job?.id} failed:`, error.message);
});

worker.on("error", (error) => {
  console.error("Worker error:", error);
});

console.log(`Email worker started with concurrency ${concurrency}`);

async function shutdown() {
  console.log("Shutting down email worker...");

  await worker.close();
  await transporter.close();
  await prisma.$disconnect();
  await redisConnection.quit();

  process.exit(0);
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
