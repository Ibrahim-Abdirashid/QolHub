"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

interface AuthFormProps {
  mode: "login" | "register";
}

export function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [blockedInfo, setBlockedInfo] = useState<{ reason: string } | null>(null);
  const [pendingApproval, setPendingApproval] = useState(false);
  const [rejected, setRejected] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const defaultRole = searchParams.get("role") === "landlord" ? "landlord" : "tenant";

  useEffect(() => {
    if (!blockedInfo) return;

    timerRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [blockedInfo]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const form = new FormData(e.currentTarget);
    const body =
      mode === "login"
        ? { email: form.get("email"), password: form.get("password") }
        : {
            name: form.get("name"),
            email: form.get("email"),
            password: form.get("password"),
            phone: form.get("phone"),
            role: form.get("role"),
          };

    const res = await fetch(`/api/auth/${mode}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      if (data.blocked) {
        setBlockedInfo({ reason: data.blockReason });
        setCountdown(60);
        return;
      }
      if (data.pendingApproval) {
        setPendingApproval(true);
        return;
      }
      if (data.rejected) {
        setRejected(true);
        return;
      }
      setError(data.error || "An error occurred");
      return;
    }

    if (mode === "register" && data.pendingApproval) {
      setPendingApproval(true);
      return;
    }

    const redirect = searchParams.get("redirect");
    if (redirect) {
      router.push(redirect);
      return;
    }

    if (data.user.role === "admin" || data.user.role === "super_admin") router.push("/admin");
    else if (data.user.role === "landlord") router.push("/dashboard");
    else router.push("/properties");
  }

  if (pendingApproval) {
    return (
      <div className="text-center space-y-4">
        {/* Admin contact — shown prominently at the top */}
        <div className="rounded-lg bg-blue-50 border border-blue-200 p-3 flex items-center gap-3">
          <svg className="h-5 w-5 text-blue-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
          </svg>
          <div className="text-left">
            <p className="text-xs font-semibold text-blue-800">Need faster approval? Contact admin:</p>
            <a
              href="tel:+252615000000"
              className="text-sm font-bold text-blue-700 hover:text-blue-900 hover:underline"
            >
              +252 61 500 0000
            </a>
          </div>
        </div>

        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-amber-100">
          <svg className="h-8 w-8 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-slate-800">Your Account is Registered</h2>
        <div className="rounded-lg bg-amber-50 border border-amber-200 p-4 text-left space-y-2">
          <p className="text-sm font-semibold text-amber-800">⏳ Awaiting Admin Approval</p>
          <p className="text-sm text-amber-700">
            Your application has been received. An admin will review your account and notify you once approved.
          </p>
          <p className="text-xs text-amber-600 mt-1">
            Once approved, you will be able to sign in with your email and password.
          </p>
        </div>
        <button
          onClick={() => setPendingApproval(false)}
          className="w-full rounded-lg border border-slate-200 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          Back to Login
        </button>
      </div>
    );
  }

  if (rejected) {
    return (
      <div className="text-center space-y-4">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
          <svg className="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-red-800">Application Rejected</h2>
        <div className="rounded-lg bg-red-50 border border-red-200 p-4 text-left">
          <p className="text-sm text-red-700">
            The admin has rejected your application. Please contact support for more details or to reapply.
          </p>
        </div>
        <button
          onClick={() => setRejected(false)}
          className="w-full rounded-lg border border-slate-200 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          Back to Login
        </button>
      </div>
    );
  }

  if (blockedInfo) {
    return (
      <div className="text-center space-y-4">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
          <svg className="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" /></svg>
        </div>
        <h2 className="text-xl font-bold text-red-800">Your Account is Blocked</h2>
        <div className="rounded-lg bg-red-50 border border-red-200 p-4">
          <p className="text-sm font-semibold text-red-800 mb-1">Reason:</p>
          <p className="text-sm text-red-700">{blockedInfo.reason}</p>
        </div>
        {countdown > 0 ? (
          <div className="rounded-lg bg-slate-100 p-4">
            <p className="text-sm text-slate-600">
              Your account and all data will be deleted in
            </p>
            <p className="text-3xl font-bold text-red-600 mt-2">
              {countdown}<span className="text-sm font-normal ml-1">seconds</span>
            </p>
          </div>
        ) : (
          <div className="rounded-lg bg-red-100 p-4">
            <p className="text-sm font-semibold text-red-800">
              Your account has been deleted. You are now signed out.
            </p>
          </div>
        )}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      {mode === "register" && (
        <>
          <label className="block">
            <span className="text-sm font-medium">Full Name</span>
            <input
              name="name"
              required
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm"
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium">Account Type</span>
            <select
              name="role"
              defaultValue={defaultRole}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm"
            >
              <option value="tenant">Tenant (looking for a house)</option>
              <option value="landlord">Landlord (property owner)</option>
            </select>
          </label>
          <label className="block">
            <span className="text-sm font-medium">Phone Number</span>
            <input
              name="phone"
              type="tel"
              placeholder="+252 63 ..."
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm"
            />
          </label>
        </>
      )}

      <label className="block">
        <span className="text-sm font-medium">Email</span>
        <input
          name="email"
          type="email"
          required
          className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm"
        />
      </label>

      <label className="block">
        <span className="text-sm font-medium">Password</span>
        <input
          name="password"
          type="password"
          required
          minLength={6}
          className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm"
        />
      </label>

      <Button type="submit" fullWidth disabled={loading}>
        {loading
          ? "Processing..."
          : mode === "login"
            ? "Sign In"
            : "Sign Up"}
      </Button>

      <p className="text-center text-sm text-slate-600">
        {mode === "login" ? (
          <>
            Don't have an account?{" "}
            <Link href="/auth/register" className="font-semibold text-[#0c3d6e]">
              Sign Up
            </Link>
          </>
        ) : (
          <>
            Already have an account?{" "}
            <Link href="/auth/login" className="font-semibold text-[#0c3d6e]">
              Sign In
            </Link>
          </>
        )}
      </p>
    </form>
  );
}
