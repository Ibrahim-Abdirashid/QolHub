import { redirect } from "next/navigation";
import { getSession, requireRole } from "@/lib/auth";
import { MessagesView } from "@/components/dashboard/MessagesView";

export const metadata = {
  title: "Fariimaha | QolHub Admin",
};

export default async function AdminMessagesPage() {
  const session = await getSession();
  if (!requireRole(session, ["admin"])) {
    redirect("/auth/login?redirect=/admin/messages");
  }

  return (
    <div className="p-8">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Fariimaha</h1>
        <p className="mt-1 text-slate-600">
          Halkan ka akhriso oo ku jawaab fariimaha milkiilayaasha iyo kireystayaasha.
        </p>
      </header>
      <MessagesView currentUserId={session!.id} />
    </div>
  );
}

