
import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";

import { connectDatabase, prisma } from "./config/database";
import { redisConnection } from "./config/redis";
import { emailQueue } from "./queues/email.queue";
import emailRoutes from "./routes/email.routes";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    message: "Welcome to ReachInbox Email Scheduler API"
  });
});

app.get("/health", async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    await redisConnection.ping();

    res.json({
      status: "OK",
      database: "Connected",
      redis: "Connected"
    });
  } catch (error) {
    res.status(503).json({
      status: "ERROR",
      message: "A dependency is unavailable"
    });
  }
});

app.use("/api/emails", emailRoutes);

app.get("/api/queue", async (req, res) => {
  try {
    const counts = await emailQueue.getJobCounts(
      "waiting",
      "active",
      "delayed",
      "completed",
      "failed"
    );

    res.json({
      success: true,
      counts
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Unable to retrieve queue information"
    });
  }
});

const PORT = Number(process.env.PORT || 5000);

async function startServer() {
  try {
    await connectDatabase();
    await redisConnection.ping();

    app.listen(PORT, () => {
      console.log(`Server running at http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Server startup failed:", error);
    process.exit(1);
  }
}

startServer();
