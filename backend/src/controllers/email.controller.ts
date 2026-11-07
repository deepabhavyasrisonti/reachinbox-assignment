
import { Request, Response } from "express";
import {
  scheduleEmail,
  getScheduledEmails,
  getSentEmails
} from "../services/email.service";

export async function createEmail(req: Request, res: Response) {
  try {
    const {
      recipient,
      subject,
      body,
      scheduledAt,
      senderId,
      idempotencyKey
    } = req.body;

    if (
      !recipient ||
      !subject ||
      !body ||
      !scheduledAt ||
      !idempotencyKey
    ) {
      return res.status(400).json({
        success: false,
        message: "All required fields must be provided"
      });
    }

    const parsedDate = new Date(scheduledAt);

    if (Number.isNaN(parsedDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Invalid scheduled date"
      });
    }

    const email = await scheduleEmail({
      recipient,
      subject,
      body,
      scheduledAt: parsedDate,
      senderId,
      idempotencyKey
    });

    return res.status(201).json({
      success: true,
      message: "Email scheduled successfully",
      data: email
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Something went wrong";

    return res.status(400).json({
      success: false,
      message
    });
  }
}

export async function scheduledEmails(req: Request, res: Response) {
  try {
    const emails = await getScheduledEmails();

    return res.json({
      success: true,
      count: emails.length,
      data: emails
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Unable to fetch scheduled emails"
    });
  }
}

export async function sentEmails(req: Request, res: Response) {
  try {
    const emails = await getSentEmails();

    return res.json({
      success: true,
      count: emails.length,
      data: emails
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Unable to fetch sent emails"
    });
  }
}
