import { redirect } from "next/navigation";
import { connectDB } from "@/lib/mongodb";
import { Booking } from "@/models/Booking";
import { Property } from "@/models/Property";
import { getSession, requireRole } from "@/lib/auth";
import { BarChart3 } from "lucide-react";

export const metadata = {
  title: "Booking Monitor | QolHub Admin",
  description: "Monitor all booking activities in Boorama",
};

export default async function BookingMonitorPage() {
  const session = await getSession();
  if (!requireRole(session, ["admin"])) {
    redirect("/auth/login?redirect=/admin/bookings");
  }

  await connectDB();

  const [
    totalBookings,
    pendingCount,
    approvedCount,
    rejectedCount,
    completedCount,
    availableCount,
    rentedCount,
    recentBookings,
  ] = await Promise.all([
    Booking.countDocuments(),
    Booking.countDocuments({ status: "pending" }),
    Booking.countDocuments({ status: "approved" }),
    Booking.countDocuments({ status: "rejected" }),
    Booking.countDocuments({ status: "completed" }),
    Property.countDocuments({ status: "active" }),
    Property.countDocuments({ status: "rented" }),
    Booking.find()
      .populate("property", "title city district")
      .populate("tenant", "name email phone")
      .populate("landlord", "name email")
      .sort({ createdAt: -1 })
      .limit(20)
      .lean(),
  ]);

  const approvalRate =
    totalBookings > 0
      ? Math.round((approvedCount / totalBookings) * 100)
      : 0;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Booking Monitor</h1>
        <p className="mt-2 text-slate-600">
          Monitor all booking activities and rentals in Boorama
        </p>
      </div>

      <div className="mb-8 grid gap-4 md:grid-cols-3 lg:grid-cols-6">
        <div className="rounded-lg border border-slate-200 bg-white p-5">
          <p className="text-sm font-medium text-slate-600">Total Bookings</p>
          <p className="mt-2 text-2xl font-bold">{totalBookings}</p>
        </div>
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-5">
          <p className="text-sm font-medium text-amber-800">Pending</p>
          <p className="mt-2 text-2xl font-bold text-amber-900">{pendingCount}</p>
        </div>
        <div className="rounded-lg border border-green-200 bg-green-50 p-5">
          <p className="text-sm font-medium text-green-800">Approved</p>
          <p className="mt-2 text-2xl font-bold text-green-900">{approvedCount}</p>
          <p className="mt-1 text-xs text-green-700">{approvalRate}%</p>
        </div>
        <div className="rounded-lg border border-red-200 bg-red-50 p-5">
          <p className="text-sm font-medium text-red-800">Rejected</p>
          <p className="mt-2 text-2xl font-bold text-red-900">{rejectedCount}</p>
        </div>
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-5">
          <p className="text-sm font-medium text-blue-800">Available Properties</p>
          <p className="mt-2 text-2xl font-bold text-blue-900">{availableCount}</p>
        </div>
        <div className="rounded-lg border border-slate-300 bg-slate-100 p-5">
          <p className="text-sm font-medium text-slate-700">Rented</p>
          <p className="mt-2 text-2xl font-bold text-slate-900">{rentedCount}</p>
        </div>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white">
        <div className="border-b border-slate-200 p-6">
          <h2 className="text-lg font-semibold text-slate-900">
            Recent Bookings
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="px-6 py-3 text-left font-semibold">Property</th>
                <th className="px-6 py-3 text-left font-semibold">Tenant</th>
                <th className="px-6 py-3 text-left font-semibold">Landlord</th>
                <th className="px-6 py-3 text-left font-semibold">Status</th>
                <th className="px-6 py-3 text-left font-semibold">Date</th>
              </tr>
            </thead>
            <tbody>
              {recentBookings.map((booking) => (
                <tr
                  key={String(booking._id)}
                  className="border-b border-slate-100 hover:bg-slate-50"
                >
                  <td className="px-6 py-4">
                    <p className="font-medium">
                      {(booking.property as { title?: string })?.title || "N/A"}
                    </p>
                    <p className="text-xs text-slate-500">
                      {(booking.property as { district?: string })?.district},{" "}
                      {(booking.property as { city?: string })?.city}
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <p>{(booking.tenant as { name?: string })?.name}</p>
                    <p className="text-xs text-slate-500">
                      {(booking.tenant as { email?: string })?.email}
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    {(booking.landlord as { name?: string })?.name}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${
                        booking.status === "pending"
                          ? "bg-amber-100 text-amber-800"
                          : booking.status === "approved"
                            ? "bg-green-100 text-green-800"
                            : booking.status === "rejected"
                              ? "bg-red-100 text-red-800"
                              : "bg-slate-100 text-slate-800"
                      }`}
                    >
                      {booking.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-600">
                    {new Date(booking.createdAt).toLocaleDateString("so-SO")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {recentBookings.length === 0 && (
          <div className="px-6 py-12 text-center text-slate-600">
            <BarChart3 className="mx-auto mb-3 h-12 w-12 text-slate-400" />
            <p>No booking requests yet</p>
          </div>
        )}
      </div>
    </div>
  );
}
