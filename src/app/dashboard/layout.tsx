import { redirect } from "next/navigation";
import { getSession, requireRole } from "@/lib/auth";
import { DashboardSidebar } from "@/components/layout/DashboardSidebar";
import { connectDB } from "@/lib/mongodb";
import { User } from "@/models/User";
import { Mail, Clock } from "lucide-react";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!requireRole(session, ["landlord", "admin", "tenant"])) {
    redirect("/auth/login?redirect=/dashboard");
  }

  await connectDB();
  const dbUser = await User.findById(session.id).select("emailVerified accountStatus").lean();
  
  if (!dbUser) {
    redirect("/auth/login");
  }

  const isEmailVerified = dbUser.emailVerified;
  const isPendingLandlord = session.role === "landlord" && dbUser.accountStatus === "pending";

  if (!isEmailVerified) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4">
        <div className="w-full max-w-md rounded-3xl bg-white p-8 text-center shadow-xl border border-slate-100">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-blue-100 text-blue-600 mb-6">
            <Mail className="h-10 w-10" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Please Verify Your Email</h2>
          <p className="text-slate-600 mb-6">
            We sent a verification link to <strong>{session.email}</strong>. 
            Please click the link to verify your account before accessing the dashboard.
          </p>
          <div className="rounded-xl bg-blue-50 p-4 border border-blue-100 text-sm text-blue-800">
            If you don&apos;t see the email, please check your Spam folder.
          </div>
        </div>
      </div>
    );
  }

  if (isPendingLandlord) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4">
        <div className="w-full max-w-md rounded-3xl bg-white p-8 text-center shadow-xl border border-slate-100">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-amber-100 text-amber-600 mb-6">
            <Clock className="h-10 w-10" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Your Account is Under Review</h2>
          <p className="text-slate-600 mb-6">
            The admin is currently reviewing your landlord account. You will be notified once approved so you can start listing properties.
          </p>
          <div className="rounded-xl bg-amber-50 p-4 border border-amber-100 text-sm text-amber-800 text-left">
            <p className="font-semibold mb-2">Contact Admin:</p>
            <p className="mb-1">📧 admin@qolhub.com</p>
            <p>📞 +252 63 400 0000</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <DashboardSidebar user={session} />
      <div className="flex flex-1 flex-col">{children}</div>
    </div>
  );
}
