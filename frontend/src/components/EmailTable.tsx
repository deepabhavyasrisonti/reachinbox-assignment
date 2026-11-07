
import type { Email } from "../types/email";
import { Mail, Clock, CheckCircle2, XCircle } from "lucide-react";

interface EmailTableProps {
  emails: Email[];
  loading: boolean;
  type: "scheduled" | "sent";
}

export default function EmailTable({
  emails,
  loading,
  type
}: EmailTableProps) {
  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-violet-500 border-t-transparent" />
      </div>
    );
  }

  if (emails.length === 0) {
    return (
      <div className="flex min-h-72 flex-col items-center justify-center text-center">
        <div className="mb-4 rounded-full bg-[#242630] p-5">
          <Mail size={30} className="text-gray-400" />
        </div>

        <h3 className="text-lg font-semibold">
          No {type} emails
        </h3>

        <p className="mt-2 text-sm text-gray-500">
          {type === "scheduled"
            ? "Your scheduled emails will appear here."
            : "Your sent emails will appear here."}
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead className="border-b border-[#30323A] text-xs uppercase text-gray-500">
          <tr>
            <th className="px-5 py-4">Email</th>
            <th className="px-5 py-4">Subject</th>
            <th className="px-5 py-4">
              {type === "scheduled" ? "Scheduled Time" : "Sent Time"}
            </th>
            <th className="px-5 py-4">Status</th>
          </tr>
        </thead>

        <tbody>
          {emails.map((email) => (
            <tr
              key={email.id}
              className="border-b border-[#272930] transition hover:bg-[#1C1E24]"
            >
              <td className="px-5 py-5 font-medium">
                {email.recipient}
              </td>

              <td className="max-w-56 truncate px-5 py-5 text-gray-300">
                {email.subject}
              </td>

              <td className="whitespace-nowrap px-5 py-5 text-gray-400">
                {new Date(
                  type === "scheduled"
                    ? email.scheduledAt
                    : email.sentAt || email.updatedAt
                ).toLocaleString()}
              </td>

              <td className="px-5 py-5">
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${
                    email.status === "SENT"
                      ? "bg-green-500/10 text-green-400"
                      : email.status === "FAILED"
                      ? "bg-red-500/10 text-red-400"
                      : email.status === "PROCESSING"
                      ? "bg-blue-500/10 text-blue-400"
                      : "bg-yellow-500/10 text-yellow-400"
                  }`}
                >
                  {email.status === "SENT" ? (
                    <CheckCircle2 size={13} />
                  ) : email.status === "FAILED" ? (
                    <XCircle size={13} />
                  ) : (
                    <Clock size={13} />
                  )}

                  {email.status}
                </span>

                {email.errorMessage && (
                  <p className="mt-1 max-w-48 text-xs text-red-400">
                    {email.errorMessage}
                  </p>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
