
import { LogOut, Bell, UserCircle } from "lucide-react";

interface HeaderProps {
  title: string;
}

export default function Header({ title }: HeaderProps) {
  return (
    <header className="flex items-center justify-between border-b border-[#272930] px-8 py-5">
      <div>
        <h2 className="text-xl font-semibold">{title}</h2>
        <p className="mt-1 text-xs text-gray-500">
          Manage your email campaigns
        </p>
      </div>

      <div className="flex items-center gap-5">
        <button
          className="text-gray-400 hover:text-white"
          aria-label="Notifications"
          title="Notifications"
        >
          <Bell size={20} />
        </button>

        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-violet-600/20 text-violet-400">
            <UserCircle size={25} />
          </div>

          <div className="hidden sm:block">
            <p className="text-sm font-medium">Demo User</p>
            <p className="text-xs text-gray-500">
              demo@reachinbox.ai
            </p>
          </div>

          <button
            onClick={() =>
              alert("Google login and logout will be connected in the OAuth phase.")
            }
            className="ml-2 text-gray-400 hover:text-white"
            title="Logout integration pending"
          >
            <LogOut size={19} />
          </button>
        </div>
      </div>
    </header>
  );
}
