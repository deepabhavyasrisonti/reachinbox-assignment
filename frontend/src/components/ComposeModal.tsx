
import { useState } from "react";
import Papa from "papaparse";
import { X, Upload, Send, FileSpreadsheet } from "lucide-react";

interface ComposeModalProps {
  onClose: () => void;
  onSchedule: (
    recipients: string[],
    subject: string,
    body: string,
    startTime: string,
    delay: number,
    hourlyLimit: number
  ) => Promise<void>;
}

export default function ComposeModal({
  onClose,
  onSchedule
}: ComposeModalProps) {
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [recipients, setRecipients] = useState<string[]>([]);
  const [startTime, setStartTime] = useState("");
  const [delay, setDelay] = useState(2);
  const [hourlyLimit, setHourlyLimit] = useState(100);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleFile = (file?: File) => {
    if (!file) return;

    const validFile =
      file.name.endsWith(".csv") ||
      file.name.endsWith(".txt");

    if (!validFile) {
      setError("Please upload a CSV or TXT file.");
      return;
    }

    Papa.parse<string[]>(file, {
      skipEmptyLines: true,
      complete: (results) => {
        const found = results.data
          .flat()
          .flatMap((value) =>
            value.match(
              /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g
            ) || []
          );

        const unique = [...new Set(
          found.map((email) => email.trim().toLowerCase())
        )];

        setRecipients(unique);
        setError("");

        if (unique.length === 0) {
          setError("No valid email addresses found.");
        }
      },
      error: () => {
        setError("Unable to read the uploaded file.");
      }
    });
  };

  const handleSubmit = async () => {
    setError("");

    if (!subject.trim() || !body.trim()) {
      setError("Please enter subject and email body.");
      return;
    }

    if (recipients.length === 0) {
      setError("Please upload a CSV or TXT file with email addresses.");
      return;
    }

    if (!startTime || new Date(startTime).getTime() <= Date.now()) {
      setError("Please select a future start time.");
      return;
    }

    if (delay < 1 || hourlyLimit < 1) {
      setError("Delay and hourly limit must be positive.");
      return;
    }

    try {
      setLoading(true);

      await onSchedule(
        recipients,
        subject,
        body,
        startTime,
        delay,
        hourlyLimit
      );

      onClose();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Scheduling failed."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/70 p-4 backdrop-blur-sm">
      <div className="my-auto w-full max-w-2xl rounded-2xl border border-[#30323A] bg-[#191B20] shadow-2xl">

        <div className="flex items-center justify-between border-b border-[#30323A] p-6">
          <div>
            <h2 className="text-xl font-bold">
              Compose New Email
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Create your email campaign
            </p>
          </div>

          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white"
          >
            <X size={22} />
          </button>
        </div>

        <div className="space-y-5 p-6">

          <div>
            <label className="mb-2 block text-sm text-gray-300">
              Email Subject
            </label>
            <input
              className="input-field"
              placeholder="Enter email subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            />
          </div>

          <div>
            <label className="mb-2 block text-sm text-gray-300">
              Email Body
            </label>
            <textarea
              className="input-field min-h-32 resize-y"
              placeholder="Write your email message..."
              value={body}
              onChange={(e) => setBody(e.target.value)}
            />
          </div>

          <div>
            <label className="mb-2 block text-sm text-gray-300">
              Upload Email Leads
            </label>

            <label className="flex cursor-pointer flex-col items-center rounded-xl border-2 border-dashed border-[#41434D] bg-[#15171C] p-6 transition hover:border-violet-500">
              <Upload size={27} className="mb-3 text-violet-400" />

              <span className="text-sm font-medium">
                Click to upload CSV or TXT
              </span>

              <span className="mt-1 text-xs text-gray-500">
                Upload your email leads file
              </span>

              <input
                type="file"
                accept=".csv,.txt,text/csv,text/plain"
                className="hidden"
                onChange={(e) => {
                  handleFile(e.target.files?.[0]);
                  e.target.value = "";
                }}
              />
            </label>

            {recipients.length > 0 && (
              <div className="mt-3 flex items-center gap-2 rounded-lg bg-green-500/10 p-3 text-sm text-green-400">
                <FileSpreadsheet size={19} />
                {recipients.length} unique email addresses detected
              </div>
            )}
          </div>

          <div>
            <label className="mb-2 block text-sm text-gray-300">
              Start Time
            </label>

            <input
              type="datetime-local"
              className="input-field"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-2 block text-sm text-gray-300">
                Delay Between Emails (seconds)
              </label>

              <input
                type="number"
                min="1"
                className="input-field"
                value={delay}
                onChange={(e) => setDelay(Number(e.target.value))}
              />
            </div>

            <div>
              <label className="mb-2 block text-sm text-gray-300">
                Hourly Limit
              </label>

              <input
                type="number"
                min="1"
                className="input-field"
                value={hourlyLimit}
                onChange={(e) =>
                  setHourlyLimit(Number(e.target.value))
                }
              />
            </div>
          </div>

          <p className="text-xs text-gray-500">
            Sending interval and hourly limit are campaign settings.
            Backend enforcement will be connected in the rate-limiting phase.
          </p>

          {error && (
            <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-400">
              {error}
            </div>
          )}

          <div className="flex justify-end gap-3 border-t border-[#30323A] pt-5">
            <button
              onClick={onClose}
              className="rounded-lg border border-[#41434D] px-5 py-3 text-sm text-gray-300 hover:bg-[#25272E]"
            >
              Cancel
            </button>

            <button
              onClick={handleSubmit}
              disabled={loading}
              className="primary-button flex items-center gap-2"
            >
              <Send size={16} />
              {loading ? "Scheduling..." : "Schedule Emails"}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
