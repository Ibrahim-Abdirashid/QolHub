import { Suspense } from "react";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { AuthForm } from "@/components/auth/AuthForm";

export default function LoginPage() {
  return (
    <PublicLayout>
      <div className="mx-auto max-w-md px-4 py-16">
        <h1 className="text-2xl font-bold text-slate-900">Soo Gali</h1>
        <p className="mt-2 text-slate-600">Ku soo gal akoonkaaga QolHub</p>
        <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <Suspense>
            <AuthForm mode="login" />
          </Suspense>
        </div>
      </div>
    </PublicLayout>
  );
}
