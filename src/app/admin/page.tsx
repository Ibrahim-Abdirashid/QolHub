import Link from "next/link";
import { connectDB } from "@/lib/mongodb";
import { User } from "@/models/User";
import { Property } from "@/models/Property";
import { Booking } from "@/models/Booking";
import { serializeProperty } from "@/lib/api";
import { PendingApprovals } from "@/components/admin/PendingApprovals";
import { ActiveProperties } from "@/components/admin/ActiveProperties";

export default async function AdminPage() {
  let stats = {
    totalUsers: 0,
    activeHouses: 0,
    pendingHouses: 0,
    rentedHouses: 0,
    totalBookings: 0,
  };
  let pending: ReturnType<typeof serializeProperty>[] = [];
  let active: ReturnType<typeof serializeProperty>[] = [];
  let recentUsers: { name: string; role: string; _id: string }[] = [];

  try {
    await connectDB();
    const [
      totalUsers,
      activeHouses,
      pendingHouses,
      rentedHouses,
      totalBookings,
      pendingList,
      activeList,
      users,
    ] = await Promise.all([
      User.countDocuments(),
      Property.countDocuments({ status: "active" }),
      Property.countDocuments({ status: "pending" }),
      Property.countDocuments({ status: "rented" }),
      Booking.countDocuments(),
      Property.find({ status: "pending" })
        .populate("landlord", "name")
        .sort({ createdAt: -1 })
        .limit(5)
        .lean(),
      Property.find({ status: "active" })
        .populate("landlord", "name phone avatar")
        .sort({ createdAt: -1 })
        .limit(10)
        .lean(),
      User.find().sort({ createdAt: -1 }).limit(5).select("name role").lean(),
    ]);

    stats = {
      totalUsers,
      activeHouses,
      pendingHouses,
      rentedHouses,
      totalBookings,
    };
    pending = pendingList.map((p) =>
      serializeProperty(p as Record<string, unknown>)
    );
    active = activeList.map((p) =>
      serializeProperty(p as Record<string, unknown>)
    );
    recentUsers = users.map((u) => ({
      _id: String(u._id),
      name: u.name,
      role:
        u.role === "landlord"
          ? "Landlord"
          : u.role === "tenant"
            ? "Tenant"
            : "Admin",
    }));
  } catch (err) {
    console.error("Admin dashboard DB error:", err);
  }

  const cards = [
    {
      label: "Total Users",
      value: stats.totalUsers,
      href: "/admin/users",
    },
    {
      label: "Active Properties",
      value: stats.activeHouses,
      sub: `${stats.rentedHouses} Rented`,
      href: "/admin/properties?status=active",
    },
    {
      label: "Pending Approval",
      value: stats.pendingHouses,
      sub: "New Requests",
      href: "/admin/properties?status=pending",
      highlight: stats.pendingHouses > 0,
    },
    {
      label: "Bookings",
      value: stats.totalBookings,
      sub: "Borama bookings",
      href: "/admin/bookings",
    },
  ];

  return (
    <>
      <header className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 bg-white px-8 py-6">
        <div>
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          <p className="mt-1 text-sm text-slate-600">
            Senior Admin — QolHub Borama
          </p>
        </div>
      </header>

      <div className="p-8">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {cards.map((c) => (
            <Link
              key={c.label}
              href={c.href}
              className={`rounded-2xl border p-5 transition hover:shadow-md ${
                c.highlight
                  ? "border-amber-300 bg-amber-50"
                  : "border-slate-200 bg-white"
              }`}
            >
              <p className="text-sm text-slate-500">{c.label}</p>
              <p className="mt-2 text-3xl font-bold text-slate-900">{c.value}</p>
              {c.sub && (
                <p className="mt-1 text-xs text-slate-400">{c.sub}</p>
              )}
            </Link>
          ))}
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 lg:col-span-2">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-bold">Pending Approvals</h2>
              <Link
                href="/admin/properties?status=pending"
                className="text-sm font-semibold text-[#0c3d6e] hover:underline"
              >
                See All
              </Link>
            </div>
            <PendingApprovals properties={pending} />
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-bold">User Management</h2>
              <Link
                href="/admin/users"
                className="text-sm font-semibold text-[#0c3d6e] hover:underline"
              >
                See All
              </Link>
            </div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Recent Signups
            </p>
            <ul className="mt-4 space-y-3">
              {recentUsers.length > 0 ? (
                recentUsers.map((u) => (
                  <li key={u._id} className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-accent text-sm font-bold text-[#0c3d6e]">
                      {u.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{u.name}</p>
                      <p className="text-xs text-slate-500">{u.role}</p>
                    </div>
                  </li>
                ))
              ) : (
                <p className="text-sm text-slate-500">No users yet</p>
              )}
            </ul>
          </div>
        </div>

        <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-bold">Active Properties</h2>
            <Link
              href="/admin/properties"
              className="text-sm font-semibold text-[#0c3d6e] hover:underline"
            >
              See All
            </Link>
          </div>
          <ActiveProperties properties={active} />
        </div>
      </div>
    </>
  );
}
