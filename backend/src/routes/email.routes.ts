
import { Router } from "express";

import {
  createEmail,
  scheduledEmails,
  sentEmails
} from "../controllers/email.controller";

const router = Router();

router.post("/schedule", createEmail);

router.get("/scheduled", scheduledEmails);

router.get("/sent", sentEmails);

export default router;
