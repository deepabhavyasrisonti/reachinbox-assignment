
export type EmailStatus =
  | "SCHEDULED"
  | "PROCESSING"
  | "SENT"
  | "FAILED";

export interface Email {
  id: string;
  recipient: string;
  subject: string;
  body: string;
  scheduledAt: string;
  sentAt?: string | null;
  updatedAt: string;
  createdAt: string;
  status: EmailStatus;
  senderId: string;
  errorMessage?: string | null;
}

export interface ScheduleEmailRequest {
  recipient: string;
  subject: string;
  body: string;
  scheduledAt: string;
  senderId: string;
  idempotencyKey: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  count?: number;
  data: T;
}
