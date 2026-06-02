import { connectDB } from "@/lib/mongodb";
import { User } from "@/models/User";
import { getSession, createSession } from "@/lib/auth";
import Link from "next/link";
import { CheckCircle2, XCircle } from "lucide-react";

export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;

  let success = false;
  let message = "";

  if (!token) {
    message = "Token ma jiro. Fadlan hubi linkiga lagusoo diray.";
  } else {
    try {
      await connectDB();
      const user = await User.findOne({ verificationToken: token });

      if (!user) {
        message = "Linkigan waa mid dhacay ama qaldan.";
      } else {
        user.emailVerified = true;
        user.verificationToken = undefined;
        await user.save();

        // Update current session if the user is logged in as this user
        const currentSession = await getSession();
        if (currentSession && currentSession.id === user._id.toString()) {
          await createSession({
            ...currentSession,
            emailVerified: true,
          });
        }

        success = true;
        message = "Email-kaagii si guul leh ayaa loo xaqiijiyay!";
      }
    } catch (error) {
      console.error("Verification error:", error);
      message = "Cilad ayaa dhacday intii la xaqiijinayey.";
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md rounded-3xl bg-white p-8 text-center shadow-xl border border-slate-100">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full mb-6">
          {success ? (
            <div className="rounded-full bg-green-100 p-4 text-green-600 animate-bounce">
              <CheckCircle2 className="h-12 w-12" />
            </div>
          ) : (
            <div className="rounded-full bg-red-100 p-4 text-red-600">
              <XCircle className="h-12 w-12" />
            </div>
          )}
        </div>
        <h1 className="text-2xl font-bold text-slate-900 mb-2">
          {success ? "Waa Guul!" : "Xaqiijintu Waa Fashilantay"}
        </h1>
        <p className="text-slate-600 mb-8">{message}</p>
        
        <Link
          href="/dashboard"
          className="inline-block w-full rounded-xl bg-[#0c3d6e] px-4 py-3 font-semibold text-white hover:bg-[#0a2e53] transition-colors"
        >
          {success ? "Gudaha U Gal Dashboard-ka" : "Ku Noqo Bogga Hore"}
        </Link>
      </div>
    </div>
  );
}
