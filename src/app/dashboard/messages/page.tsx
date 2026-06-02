import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { MessagesView } from "@/components/dashboard/MessagesView";

export default async function MessagesPage() {
  const session = await getSession();
  if (!session) redirect("/auth/login");

  return (
    <div className="p-8">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Messages</h1>
        <p className="mt-1 text-slate-600">
          View and reply to your conversations here.
        </p>
      </header>
      <MessagesView currentUserId={session.id} />
    </div>
  );
}
