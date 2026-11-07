
import axios from "axios";
import type {
  Email,
  ScheduleEmailRequest,
  ApiResponse
} from "../types/email";

const api = axios.create({
  baseURL:
    import.meta.env.VITE_API_URL ||
    "http://localhost:5000/api",
  headers: {
    "Content-Type": "application/json"
  },
  timeout: 15000
});

export const getScheduledEmails = async (): Promise<Email[]> => {
  const response = await api.get<ApiResponse<Email[]>>(
    "/emails/scheduled"
  );

  return response.data.data;
};

export const getSentEmails = async (): Promise<Email[]> => {
  const response = await api.get<ApiResponse<Email[]>>(
    "/emails/sent"
  );

  return response.data.data;
};

export const scheduleEmail = async (
  data: ScheduleEmailRequest
): Promise<Email> => {
  const response = await api.post<ApiResponse<Email>>(
    "/emails/schedule",
    data
  );

  return response.data.data;
};

export default api;
