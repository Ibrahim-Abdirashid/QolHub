"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Home,
  MessageSquare,
  BarChart3,
  Users,
} from "lucide-react";
import type { SessionUser } from "@/types";
import { BRAND_NAME } from "@/lib/constants";

const ADMIN_PATH = "/admin";

const links = [
  { href: ADMIN_PATH, label: "Dashboard", icon: LayoutDashboard },
  { href: `${ADMIN_PATH}/properties`, label: "Properties", icon: Home },
  { href: `${ADMIN_PATH}/bookings`, label: "Bookings", icon: BarChart3 },
  { href: `${ADMIN_PATH}/users`, label: "Users", icon: Users },
  { href: `${ADMIN_PATH}/messages`, label: "Messages", icon: MessageSquare },
];

export function AdminSidebar({ user }: { user: SessionUser }) {
  const pathname = usePathname();
  const [unreadCount, setUnreadCount] = useState(0);
  const [blockedState, setBlockedState] = useState<{ reason: string; deleteAt: string } | null>(null);
  const [countdown, setCountdown] = useState(60);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    async function fetchUnread() {
      try {
        const res = await fetch("/api/messages/unread");
        if (res.ok) {
          const data = await res.json();
          if (data.blocked) {
            setBlockedState({ reason: data.blockReason, deleteAt: data.deleteAt });
            clearInterval(interval);
            return;
          }
          setUnreadCount(data.count);
        }
      } catch (err) {
        console.error(err);
      }
    }
    fetchUnread();
    interval = setInterval(fetchUnread, 10000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!blockedState) return;
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          fetch("/api/auth/logout", { method: "POST" }).finally(() => {
            window.location.href = "/";
          });
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [blockedState]);

  return (
    <aside className="flex w-64 shrink-0 flex-col border-r border-slate-200 bg-white">
      <div className="border-b border-slate-100 p-6">
        <Link href="/" className="text-xl font-bold text-[#0c3d6e]">
          {BRAND_NAME}
        </Link>
        <p className="mt-1 text-xs text-slate-500">Admin Panel</p>
      </div>
      <nav className="flex-1 space-y-1 p-4">
        {links.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || (href === ADMIN_PATH && pathname === ADMIN_PATH);
          const isMessages = href === `${ADMIN_PATH}/messages`;
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                active
                  ? "bg-accent text-[#0c3d6e]"
                  : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className="h-4 w-4" />
                {label}
              </div>
              {isMessages && unreadCount > 0 && (
                <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-bold text-white shadow-xs">
                  {unreadCount}
                </span>
              )}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-slate-100 p-4">
        <div className="flex items-center gap-3 rounded-lg bg-slate-50 p-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#0c3d6e] text-sm font-bold text-white">
            {user.name.charAt(0)}
          </div>
          <div>
            <p className="text-sm font-semibold">{user.name}</p>
            <p className="text-xs text-slate-500">Admin</p>
          </div>
        </div>
      </div>
      {blockedState && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/80 backdrop-blur-md px-4">
          <div className="bg-white rounded-3xl w-full max-w-md p-8 shadow-2xl text-center space-y-6">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-red-100 animate-bounce">
              <svg className="h-10 w-10 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
              </svg>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-red-900">Your Account Has Been Blocked</h2>
              <p className="text-sm text-slate-500 mt-1">The system detected a policy violation.</p>
            </div>
            <div className="rounded-2xl bg-red-50 border border-red-100 p-5 text-left">
              <p className="text-xs font-bold text-red-800 uppercase tracking-wide mb-1">Reason for Block:</p>
              <p className="text-sm text-red-700 font-medium">{blockedState.reason}</p>
            </div>
            <div className="rounded-2xl bg-slate-50 p-5">
              <p className="text-xs text-slate-500 font-medium">
                Your account and all data will be deleted from the system:
              </p>
              <p className="text-4xl font-extrabold text-red-600 mt-2 tracking-tight">
                {countdown} <span className="text-sm font-semibold text-red-500">seconds</span>
              </p>
            </div>
            <p className="text-[11px] text-slate-400">
              You will be automatically signed out when the timer ends.
            </p>
          </div>
        </div>
      )}
    </aside>
  );
}
