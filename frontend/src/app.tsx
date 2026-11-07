
import { useCallback, useEffect, useState } from "react";
import { RefreshCw, Plus, Mail, Send, Clock } from "lucide-react";

import Sidebar from "./components/sidebar";
import Header from "./components/Header";
import EmailTable from "./components/EmailTable";
import ComposeModal from "./components/ComposeModal";

import {
  getScheduledEmails,
  getSentEmails,
  scheduleEmail
} from "./services/api";

import type { Email } from "./types/email";

type Tab = "scheduled" | "sent";

function App() {
  const [activeTab, setActiveTab] = useState<Tab>("scheduled");
  const [showCompose, setShowCompose] = useState(false);

  const [scheduled, setScheduled] = useState<Email[]>([]);
  const [sent, setSent] = useState<Email[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const loadEmails = useCallback(async () => {
    try {
      setError("");

      const [scheduledData, sentData] = await Promise.all([
        getScheduledEmails(),
        getSentEmails()
      ]);

      setScheduled(scheduledData);
      setSent(sentData);
    } catch (err) {
      console.error(err);
      setError(
        "Unable to connect to backend. Please check whether the server is running."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadEmails();

    const interval = window.setInterval(() => {
      void loadEmails();
    }, 10000);

    return () => window.clearInterval(interval);
  }, [loadEmails]);

  const handleSchedule = async (
    recipients: string[],
    subject: string,
    body: string,
    startTime: string,
    delay: number,
    hourlyLimit: number
  ) => {
    const start = new Date(startTime);

    if (Number.isNaN(start.getTime()) || start.getTime() <= Date.now()) {
      throw new Error("Select a valid future start time.");
    }

    let successful = 0;
    const failures: string[] = [];

    // Schedule sequentially to preserve submission order.
    // The backend rate limiter will enforce the actual hourly cap later.
    for (let index = 0; index < recipients.length; index++) {
      const scheduledAt = new Date(
        start.getTime() + index * delay * 1000
      );

      try {
        await scheduleEmail({
          recipient: recipients[index],
          subject,
          body,
          scheduledAt: scheduledAt.toISOString(),
          senderId: "default",
          idempotencyKey: crypto.randomUUID()
        });

        successful++;
      } catch (err) {
        console.error(
          `Failed to schedule ${recipients[index]}`,
          err
        );

        failures.push(recipients[index]);
      }
    }

    await loadEmails();

    if (failures.length > 0) {
      setNotice(
        `${successful} emails scheduled. ${failures.length} failed.`
      );

      throw new Error(
        `${failures.length} email(s) could not be scheduled. Please check the backend.`
      );
    }

    setNotice(
      `Successfully scheduled ${successful} emails. Requested hourly limit: ${hourlyLimit}.`
    );
  };

  const currentEmails =
    activeTab === "scheduled" ? scheduled : sent;

  return (
    <div className="min-h-screen bg-dark">

      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onCompose={() => setShowCompose(true)}
      />

      <main className="ml-64 min-h-screen">

        <Header
          title={
            activeTab === "scheduled"
              ? "Scheduled Emails"
              : "Sent Emails"
          }
        />

        <section className="p-8">

          <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">

            <div>
              <h1 className="text-2xl font-bold">
                Email Overview
              </h1>

              <p className="mt-2 text-sm text-gray-500">
                Monitor and manage your email campaigns.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => void loadEmails()}
                className="flex items-center gap-2 rounded-lg border border-[#30323A] px-4 py-3 text-sm text-gray-300 hover:bg-[#22242A]"
              >
                <RefreshCw size={16} />
                Refresh
              </button>

              <button
                onClick={() => setShowCompose(true)}
                className="primary-button flex items-center gap-2"
              >
                <Plus size={18} />
                Compose New Email
              </button>
            </div>

          </div>

          {notice && (
            <div className="mb-5 flex items-center justify-between rounded-lg border border-green-500/20 bg-green-500/10 p-3 text-sm text-green-400">
              {notice}

              <button
                onClick={() => setNotice("")}
                className="ml-3"
              >
                ✕
              </button>
            </div>
          )}

          {error && (
            <div className="mb-5 rounded-lg border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-400">
              {error}
            </div>
          )}

          <div className="mb-8 grid grid-cols-1 gap-5 md:grid-cols-3">

            <div className="rounded-xl border border-[#30323A] bg-panel p-5">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-400">
                  Scheduled Emails
                </p>
                <Clock className="text-violet-400" size={22} />
              </div>

              <h2 className="mt-4 text-3xl font-bold">
                {scheduled.length}
              </h2>

              <p className="mt-2 text-xs text-gray-500">
                Pending and processing
              </p>
            </div>

            <div className="rounded-xl border border-[#30323A] bg-panel p-5">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-400">
                  Sent Emails
                </p>
                <Send className="text-green-400" size={22} />
              </div>

              <h2 className="mt-4 text-3xl font-bold">
                {sent.filter(e => e.status === "SENT").length}
              </h2>

              <p className="mt-2 text-xs text-gray-500">
                Successfully sent
              </p>
            </div>

            <div className="rounded-xl border border-[#30323A] bg-panel p-5">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-400">
                  Failed Emails
                </p>
                <Mail className="text-red-400" size={22} />
              </div>

              <h2 className="mt-4 text-3xl font-bold">
                {sent.filter(e => e.status === "FAILED").length}
              </h2>

              <p className="mt-2 text-xs text-gray-500">
                Sending failures
              </p>
            </div>

          </div>

          <div className="mb-5 flex items-center gap-5 border-b border-[#30323A]">
            <button
              onClick={() => setActiveTab("scheduled")}
              className={`border-b-2 px-2 pb-4 text-sm font-medium ${
                activeTab === "scheduled"
                  ? "border-violet-500 text-violet-400"
                  : "border-transparent text-gray-500"
              }`}
            >
              Scheduled ({scheduled.length})
            </button>

            <button
              onClick={() => setActiveTab("sent")}
              className={`border-b-2 px-2 pb-4 text-sm font-medium ${
                activeTab === "sent"
                  ? "border-violet-500 text-violet-400"
                  : "border-transparent text-gray-500"
              }`}
            >
              Sent ({sent.length})
            </button>
          </div>

          <div className="overflow-hidden rounded-xl border border-[#30323A] bg-panel">

            <div className="border-b border-[#30323A] px-5 py-4">
              <h3 className="font-semibold">
                {activeTab === "scheduled"
                  ? "Your Scheduled Emails"
                  : "Your Sent Emails"}
              </h3>

              <p className="mt-1 text-xs text-gray-500">
                Email records retrieved from the backend.
              </p>
            </div>

            <EmailTable
              emails={currentEmails}
              loading={loading}
              type={activeTab}
            />

          </div>

        </section>
      </main>

      {showCompose && (
        <ComposeModal
          onClose={() => setShowCompose(false)}
          onSchedule={handleSchedule}
        />
      )}

    </div>
  );
}

export default App;
