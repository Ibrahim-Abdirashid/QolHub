"use client";

import Link from "next/link";
import { Search } from "lucide-react";
import type { SessionUser } from "@/types";
import { BRAND_NAME } from "@/lib/constants";

interface HeaderProps {
  user?: SessionUser | null;
}

export function Header({ user }: HeaderProps) {
  const dashboardHref =
    user?.role === "admin" || user?.role === "super_admin"
      ? "/admin"
      : user?.role === "landlord" || user?.role === "tenant"
        ? "/dashboard"
        : null;

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/";
  }

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-4 px-4 py-4 lg:px-8">
        <Link href="/" className="text-2xl font-bold text-[#0c3d6e]">
          {BRAND_NAME}
        </Link>

        <nav className="hidden items-center gap-8 text-sm font-medium text-slate-600 md:flex">
          <Link href="/properties" className="text-[#0c3d6e] underline-offset-4 hover:underline">
            Properties
          </Link>
          <Link href="/about" className="hover:text-[#0c3d6e]">About</Link>
          <Link href="/help" className="hover:text-[#0c3d6e]">Help</Link>
        </nav>

        <form action="/properties" className="order-3 w-full md:order-0 md:ml-auto md:max-w-xs lg:max-w-sm">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              name="city"
              type="search"
              placeholder="Search for a house..."
              className="w-full rounded-full border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-[#0c3d6e] focus:ring-1 focus:ring-[#0c3d6e]"
            />
          </div>
        </form>

        <div className="ml-auto flex items-center gap-3 md:ml-0">
          {user ? (
            <>
              {dashboardHref && (
                <Link
                  href={dashboardHref}
                  className="hidden rounded-lg bg-[#0c3d6e] px-4 py-2 text-sm font-semibold text-white sm:inline-flex"
                >
                  Dashboard
                </Link>
              )}
              <span className="hidden text-sm text-slate-600 sm:inline">{user.name}</span>
              <button
                type="button"
                onClick={handleLogout}
                className="text-sm font-medium text-slate-600 hover:text-[#0c3d6e]"
              >
                Sign Out
              </button>
            </>
          ) : (
            <>
              <Link
                href="/auth/login"
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Sign In
              </Link>
              <Link
                href="/auth/register"
                className="rounded-lg bg-[#0c3d6e] px-4 py-2 text-sm font-semibold text-white hover:bg-[#0a3259]"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
