import { redirect } from "next/navigation";
import { connectDB } from "@/lib/mongodb";
import { Booking } from "@/models/Booking";
import { getSession, requireRole } from "@/lib/auth";
import { TenantBookings } from "@/components/TenantBookings";
import { BookingManagement } from "@/components/BookingManagement";

export const metadata = {
  title: "Bookings | QolHub",
  description: "Manage your property bookings and inquiries",
};

export default async function BookingsPage() {
  const session = await getSession();
  if (!session || !requireRole(session, ["tenant", "landlord"])) {
    redirect("/auth/login?redirect=/dashboard/bookings");
  }

  await connectDB();

  let bookings;
  let isLandlord = false;

  if (session.role === "landlord") {
    isLandlord = true;
    bookings = await Booking.find({ landlord: session.id })
      .populate("property", "title price")
      .populate("tenant", "name email phone")
      .populate("landlord", "name email phone")
      .sort({ createdAt: -1 })
      .lean();
  } else {
    // Tenant
    bookings = await Booking.find({ tenant: session.id })
      .populate("property", "title price")
      .populate("tenant", "name email phone")
      .populate("landlord", "name email phone")
      .sort({ createdAt: -1 })
      .lean();
  }

  const serializedBookings = bookings.map((b: any) => ({
    ...b,
    _id: String(b._id),
    property: b.property ? { ...b.property, _id: String(b.property._id) } : null,
    tenant: b.tenant ? { ...b.tenant, _id: String(b.tenant._id) } : null,
    landlord: b.landlord ? { ...b.landlord, _id: String(b.landlord._id) } : null,
    createdAt: b.createdAt instanceof Date ? b.createdAt.toISOString() : String(b.createdAt),
    updatedAt: b.updatedAt instanceof Date ? b.updatedAt.toISOString() : String(b.updatedAt),
  }));

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">
          {isLandlord ? "Property Booking Requests" : "My Bookings"}
        </h1>
        <p className="mt-2 text-slate-600">
          {isLandlord
            ? "Tenant booking requests for your properties"
            : "Your property booking requests"}
        </p>
      </div>

      <div className="my-6">
        {isLandlord ? (
          <BookingManagement bookings={serializedBookings as any} />
        ) : (
          <TenantBookings bookings={serializedBookings as any} />
        )}
      </div>
    </div>
  );
}
