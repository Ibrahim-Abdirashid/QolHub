import { Suspense } from "react";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { AuthForm } from "@/components/auth/AuthForm";

export default function RegisterPage() {
  return (
    <PublicLayout>
      <div className="mx-auto max-w-md px-4 py-16">
        <h1 className="text-2xl font-bold text-slate-900">Create Account</h1>
        <p className="mt-2 text-slate-600">
          Sign up as a landlord or tenant
        </p>
        <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <Suspense>
            <AuthForm mode="register" />
          </Suspense>
        </div>
      </div>
    </PublicLayout>
  );
}
