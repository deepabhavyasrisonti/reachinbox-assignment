
import {
  Mail,
  Send,
  CalendarClock,
  Settings,
  Plus,
  Zap
} from "lucide-react";

interface SidebarProps {
  activeTab: "scheduled" | "sent";
  setActiveTab: (tab: "scheduled" | "sent") => void;
  onCompose: () => void;
}

export default function Sidebar({
  activeTab,
  setActiveTab,
  onCompose
}: SidebarProps) {
  return (
    <aside className="fixed left-0 top-0 z-20 flex h-screen w-64 flex-col border-r border-[#272930] bg-[#15161A] p-5">
      <div className="mb-10 flex items-center gap-3">
        <div className="rounded-xl bg-violet-600 p-2">
          <Zap size={23} />
        </div>
        <div>
          <h1 className="text-xl font-bold">ReachInbox</h1>
          <p className="text-xs text-gray-500">
            Email Scheduler
          </p>
        </div>
      </div>

      <button
        onClick={onCompose}
        className="primary-button mb-8 flex items-center justify-center gap-2"
      >
        <Plus size={18} />
        Compose New Email
      </button>

      <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-500">
        Workspace
      </p>

      <nav className="space-y-2">
        <button
          onClick={() => setActiveTab("scheduled")}
          className={`flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm transition ${
            activeTab === "scheduled"
              ? "bg-violet-600/15 text-violet-400"
              : "text-gray-400 hover:bg-[#22242A]"
          }`}
        >
          <CalendarClock size={19} />
          Scheduled Emails
        </button>

        <button
          onClick={() => setActiveTab("sent")}
          className={`flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm transition ${
            activeTab === "sent"
              ? "bg-violet-600/15 text-violet-400"
              : "text-gray-400 hover:bg-[#22242A]"
          }`}
        >
          <Send size={19} />
          Sent Emails
        </button>
      </nav>

      <div className="mt-auto">
        <button
          className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm text-gray-400 hover:bg-[#22242A]"
          onClick={() => alert("Settings will be added in a later phase.")}
        >
          <Settings size={19} />
          Settings
        </button>

        <div className="mt-5 rounded-xl border border-[#30323A] p-3">
          <div className="flex items-center gap-2">
            <Mail size={18} className="text-violet-400" />
            <span className="text-xs font-medium">
              Email automation
            </span>
          </div>
          <p className="mt-2 text-xs text-gray-500">
            Manage your scheduled campaigns in one place.
          </p>
        </div>
      </div>
    </aside>
  );
}
