# ReachInbox – Email Scheduler

A full-stack email scheduling application that allows users to upload recipient lists, compose emails, schedule delivery, and track scheduled and sent emails.

## 1. Project Overview

ReachInbox is an email scheduling platform designed to manage bulk email delivery efficiently.

The application uses a React frontend, Node.js and Express backend, PostgreSQL for persistent storage, Redis and BullMQ for background job processing, and SMTP for email delivery.

### Key Features

- Schedule emails for future delivery.
- Upload CSV and TXT files containing recipient email addresses.
- Automatically extract and identify unique email addresses.
- Configure email subject, body, start time, and sending delay.
- View scheduled and sent emails.
- Process emails using background workers.
- Persist scheduled jobs across application restarts.
- Prevent duplicate scheduling using idempotency keys.
- Configure worker concurrency and sending limits.
- Monitor queue activity through Bull Board.
- Notify administrators through Slack when rate limits are reached.
- Search email records using Elasticsearch.
- Authenticate users using Google OAuth.

## 2. Technology Stack

| Component | Technology |
|---|---|
| Frontend | React, TypeScript |
| Styling | Tailwind CSS |
| Backend | Node.js, Express, TypeScript |
| Queue | BullMQ |
| Queue Storage | Redis |
| Database | PostgreSQL |
| ORM | Prisma |
| Email Service | Nodemailer, Ethereal SMTP |
| Authentication | Google OAuth |
| Notifications | Slack OAuth / Slack API |
| Search | Elasticsearch |
| Queue Dashboard | Bull Board |
| File Parsing | PapaParse |

## 3. Project Structure

```text
reachinbox-assignment/
│
├── backend/
│   ├── prisma/
│   │   └── schema.prisma
│   │
│   ├── src/
│   │   ├── config/
│   │   │   ├── database.ts
│   │   │   └── redis.ts
│   │   │
│   │   ├── controllers/
│   │   │   └── email.controller.ts
│   │   │
│   │   ├── queues/
│   │   │   └── email.queue.ts
│   │   │
│   │   ├── routes/
│   │   │   └── email.routes.ts
│   │   │
│   │   ├── services/
│   │   │   └── email.service.ts
│   │   │
│   │   ├── workers/
│   │   │   └── email.worker.ts
│   │   │
│   │   └── server.ts
│   │
│   ├── .env
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── services/
│   │   ├── types/
│   │   ├── App.tsx
│   │   └── main.tsx
│   │
│   ├── .env
│   └── package.json
│
├── docker-compose.yml
└── README.md
```

## 4. Prerequisites

Install the following before running the application:

- Node.js and npm
- Docker Desktop
- PostgreSQL (or use the PostgreSQL Docker container)
- Redis (or use the Redis Docker container)
- Git

## 5. Installation and Setup

### Step 1: Clone the repository

```bash
git clone YOUR_GITHUB_REPOSITORY_URL
cd reachinbox-assignment
```

### Step 2: Install backend dependencies

```bash
cd backend
npm install
```

### Step 3: Configure backend environment variables

Create a `.env` file inside the backend folder.

```env
PORT=5000

DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/reachinbox?schema=public"

REDIS_HOST=127.0.0.1
REDIS_PORT=6379

SMTP_HOST=smtp.ethereal.email
SMTP_PORT=587
SMTP_USER=YOUR_ETHEREAL_USERNAME
SMTP_PASS=YOUR_ETHEREAL_PASSWORD
EMAIL_FROM="ReachInbox <your-email@example.com>"

WORKER_CONCURRENCY=2
```

Replace the placeholder values with your actual credentials.

### Step 4: Start PostgreSQL and Redis

From the project root:

```bash
docker compose up -d
```

Check running containers:

```bash
docker ps
```

### Step 5: Run Prisma migration

From the backend folder:

```bash
npx prisma generate
npx prisma migrate dev --name init
```

### Step 6: Start the backend server

```bash
npm run dev
```

The backend server runs at:

```text
http://localhost:5000
```

### Step 7: Start the email worker

Open another terminal:

```bash
cd backend
npm run worker
```

The worker processes scheduled email jobs independently of the API server.

### Step 8: Install frontend dependencies

Open another terminal:

```bash
cd frontend
npm install
```

Create `frontend/.env`:

```env
VITE_API_URL=http://localhost:5000/api
```

### Step 9: Start the frontend

```bash
npm run dev
```

Open the application:

```text
http://localhost:5173
```

## 6. Email Scheduling Workflow

1. The user logs into the application.
2. The user uploads a CSV or TXT recipient file.
3. The application extracts and validates email addresses.
4. The user enters the subject and email body.
5. The user selects the starting time and sending configuration.
6. The backend stores email records in PostgreSQL.
7. BullMQ creates background jobs in Redis.
8. Workers process jobs when they become available.
9. Nodemailer sends emails through the configured SMTP provider.
10. The database is updated with the email delivery status.

## 7. Queue Processing and Rate Limiting

BullMQ and Redis are used to manage background email jobs.

### Worker Concurrency

Worker concurrency controls how many jobs can be processed simultaneously.

The value is configurable using:

```env
WORKER_CONCURRENCY=2
```

### Minimum Delay Between Emails

A minimum sending interval should be enforced by the worker or a shared scheduling mechanism, rather than relying only on frontend delays.

### Hourly Sending Limit

The hourly sending limit must be enforced centrally using shared Redis counters or an equivalent atomic database mechanism.

When the hourly limit is reached:

- Do not permanently fail or discard pending jobs.
- Delay excess jobs until the next available hourly window.
- Preserve the original scheduling order as much as possible.
- Send a Slack notification when the limit is reached.

### Job Persistence

Redis persistence and PostgreSQL records help recover scheduled work after restarts.

A production implementation should also reconcile database records and queue jobs to recover from failures between database writes and Redis enqueue operations.

## 8. Idempotency and Duplicate Prevention

Each scheduled email should have a unique idempotency key.

The backend should check the key before creating a new email record.

If the same request is submitted again with the same key, the existing record should be returned instead of creating a duplicate.

Note: SMTP delivery and database updates are not one atomic transaction. Therefore, exactly-once delivery cannot be guaranteed by a database check alone. A robust implementation needs explicit delivery states and recovery handling for uncertain SMTP outcomes.

## 9. API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/health` | Check backend health |
| POST | `/api/emails/schedule` | Schedule an email |
| GET | `/api/emails/scheduled` | Retrieve scheduled emails |
| GET | `/api/emails/sent` | Retrieve sent and failed emails |
| GET | `/api/queue` | Retrieve queue statistics |

### Example: Schedule an Email

**POST** `/api/emails/schedule`

```json
{
  "recipient": "user@example.com",
  "subject": "Welcome to ReachInbox",
  "body": "Thank you for using ReachInbox!",
  "scheduledAt": "2026-11-08T10:00:00.000Z",
  "senderId": "user-123",
  "idempotencyKey": "unique-request-key"
}
```

## 10. Monitoring

Bull Board can provide a visual dashboard for monitoring background jobs.

It can be used to inspect:

- Waiting jobs
- Active jobs
- Delayed jobs
- Completed jobs
- Failed jobs

## 11. Environment Variables and Security

- Never commit `.env` files.
- Store OAuth credentials and SMTP passwords securely.
- Validate uploaded recipient files.
- Validate email addresses before scheduling.
- Protect dashboard and administrative routes.
- Restrict access to queue monitoring tools.
- Use HTTPS and secure OAuth redirect URLs in production.

## 12. Current Implementation Status

Update this checklist as each feature is implemented and tested.

- [x] React frontend project setup
- [x] Express backend foundation
- [x] PostgreSQL and Prisma foundation
- [x] Redis and BullMQ queue foundation
- [x] Basic email scheduling API
- [x] Basic background email worker
- [x] Ethereal SMTP integration foundation
- [ ] Google OAuth authentication
- [ ] Complete CSV/TXT upload and validation
- [ ] Minimum interval enforcement
- [ ] Shared hourly rate limiting and ordered rescheduling
- [ ] Slack OAuth and rate-limit notifications
- [ ] Elasticsearch indexing and search
- [ ] Bull Board integration
- [ ] Robust restart recovery and reconciliation
- [ ] End-to-end testing

Only mark a feature complete after it has been implemented and verified.

## 13. Future Improvements

- Add email templates.
- Add detailed delivery analytics.
- Add retry policies and failure recovery.
- Add support for additional SMTP providers.
- Improve email search and filtering.
- Add user-level sending quotas.

## 14. Conclusion

ReachInbox demonstrates how a full-stack application can use background job processing, persistent storage, and email services to schedule and manage email delivery.

The architecture separates frontend interactions, backend APIs, queue processing, and email delivery to support maintainability and scalability.

---

**Project:** ReachInbox – Email Scheduler  
**Purpose:** Full-Stack Development Assignment  
**Backend:** Node.js, Express, BullMQ  
**Frontend:** React, TypeScript, Tailwind CSS