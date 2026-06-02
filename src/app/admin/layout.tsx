import { redirect } from "next/navigation";
import { getSession, requireRole } from "@/lib/auth";
import { AdminSidebar } from "@/components/layout/AdminSidebar";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  if (!session) {
    redirect("/auth/login?redirect=/admin");
  }

  if (!requireRole(session, ["admin"])) {
    redirect("/");
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <AdminSidebar user={session} />
      <div className="flex flex-1 flex-col overflow-auto">{children}</div>
    </div>
  );
}
