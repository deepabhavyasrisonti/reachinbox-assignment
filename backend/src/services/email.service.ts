
import { prisma } from "../config/database";
import { addEmailJob } from "../queues/email.queue";

interface ScheduleEmailInput {
  recipient: string;
  subject: string;
  body: string;
  scheduledAt: Date;
  senderId?: string;
  idempotencyKey: string;
}

export async function scheduleEmail(data: ScheduleEmailInput) {
  if (data.scheduledAt.getTime() < Date.now()) {
    throw new Error("Scheduled time must be in the future");
  }

  const existing = await prisma.email.findUnique({
    where: {
      idempotencyKey: data.idempotencyKey
    }
  });

  if (existing) {
    return existing;
  }

  const email = await prisma.email.create({
    data: {
      recipient: data.recipient,
      subject: data.subject,
      body: data.body,
      scheduledAt: data.scheduledAt,
      senderId: data.senderId || "default",
      idempotencyKey: data.idempotencyKey,
      status: "SCHEDULED"
    }
  });

  try {
    await addEmailJob(
      {
        emailId: email.id,
        recipient: email.recipient,
        subject: email.subject,
        body: email.body,
        senderId: email.senderId
      },
      email.scheduledAt
    );
  } catch (error) {
    await prisma.email.update({
      where: { id: email.id },
      data: { status: "FAILED" }
    });

    throw error;
  }

  return email;
}

export async function getScheduledEmails() {
  return prisma.email.findMany({
    where: {
      status: {
        in: ["SCHEDULED", "PROCESSING"]
      }
    },
    orderBy: {
      scheduledAt: "asc"
    }
  });
}

export async function getSentEmails() {
  return prisma.email.findMany({
    where: {
      status: {
        in: ["SENT", "FAILED"]
      }
    },
    orderBy: {
      updatedAt: "desc"
    }
  });
}
