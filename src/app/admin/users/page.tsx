import { redirect } from "next/navigation";
import { connectDB } from "@/lib/mongodb";
import { User } from "@/models/User";
import { getSession, requireRole } from "@/lib/auth";
import { UserManagement } from "@/components/admin/UserManagement";

export default async function AdminUsersPage() {
  const session = await getSession();
  if (!requireRole(session, ["admin"])) {
    redirect("/auth/login?redirect=/admin/users");
  }

  await connectDB();

  const [users, deletedUsers, stats] = await Promise.all([
    User.find({ isDeleted: { $ne: true } }).select("-password").sort({ createdAt: -1 }).lean(),
    User.find({ isDeleted: true }).select("-password").sort({ updatedAt: -1 }).lean(),
    Promise.all([
      User.countDocuments({ isDeleted: { $ne: true } }),
      User.countDocuments({ role: "admin", isDeleted: { $ne: true } }),
      User.countDocuments({ role: "landlord", isDeleted: { $ne: true } }),
      User.countDocuments({ role: "tenant", isDeleted: { $ne: true } }),
      User.countDocuments({ role: "landlord", accountStatus: "pending", isDeleted: { $ne: true } }),
    ]).then(([total, admins, landlords, tenants, pendingLandlords]) => ({
      total,
      admins,
      landlords,
      tenants,
      pendingLandlords,
    })),
  ]);

  const serializeUser = (u: Record<string, unknown>) => ({
    _id: String(u._id),
    name: u.name as string,
    email: u.email as string,
    role: u.role as string,
    phone: u.phone as string | undefined,
    blocked: (u.blocked as boolean) ?? false,
    accountStatus: (u.accountStatus as string) ?? null,
    isDeleted: (u.isDeleted as boolean) ?? false,
    createdAt: (u.createdAt as Date).toISOString(),
  });

  const serialized = users.map(serializeUser);
  const serializedDeleted = deletedUsers.map(serializeUser);

  return (
    <div className="space-y-6 p-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
        <p className="mt-2 text-gray-600">
          Maamul dadka is-diiwaangeliyey — block, unblock, tirtir
        </p>
      </div>

      <UserManagement initialUsers={serialized} deletedUsers={serializedDeleted} stats={stats} currentUserRole={session!.role as "admin" | "super_admin"} />
    </div>
  );
}
