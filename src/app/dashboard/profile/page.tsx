import { connectDB } from "@/lib/mongodb";
import { User } from "@/models/User";
import { getSession } from "@/lib/auth";
import { ProfileEditForm } from "@/components/ProfileEditForm";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function ProfileEditPage() {
  const session = await getSession();
  if (!session?.id) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 mb-4">Please sign in to edit your profile</p>
        <Link
          href="/auth/login"
          className="text-blue-600 hover:underline font-medium"
        >
          Sign In
        </Link>
      </div>
    );
  }

  await connectDB();

  const user = await User.findById(session.id).select("-password").lean();
  if (!user) {
    return <div>User not found</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/dashboard"
          className="text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Edit Profile</h1>
          <p className="text-gray-600 mt-1">
            Update your personal information
          </p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-8 max-w-2xl">
        <ProfileEditForm initialData={{
          ...user,
          _id: String(user._id),
          createdAt: user.createdAt?.toString(),
          updatedAt: user.updatedAt?.toString(),
        } as any} />
      </div>
    </div>
  );
}
