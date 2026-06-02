import { redirect } from "next/navigation";
import Link from "next/link";
import { connectDB } from "@/lib/mongodb";
import { Property } from "@/models/Property";
import { getSession, requireRole } from "@/lib/auth";
import { PropertyModeration } from "@/components/PropertyModeration";

interface PageProps {
  searchParams: Promise<{ status?: string; page?: string }>;
}

export const metadata = {
  title: "Property Moderation | QolHub Admin",
  description: "Approve and moderate property listings",
};

export default async function AdminPropertiesPage({
  searchParams,
}: PageProps) {
  const session = await getSession();
  if (!requireRole(session, ["admin"])) {
    redirect("/auth/login?redirect=/admin/properties");
  }

  const params = await searchParams;
  const status =
    (params.status as "pending" | "active" | "rejected" | "rented") ||
    "pending";
  const page = Number(params.page) || 1;

  await connectDB();

  const limit = 10;
  const skip = (page - 1) * limit;

  const [properties, total, stats] = await Promise.all([
    Property.find({ status })
      .populate("landlord", "name email phone")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Property.countDocuments({ status }),
    Promise.all([
      Property.countDocuments({ status: "pending" }),
      Property.countDocuments({ status: "active" }),
      Property.countDocuments({ status: "rejected" }),
      Property.countDocuments({ status: "rented" }),
    ]).then(([pending, active, rejected, rented]) => ({
      pending,
      active,
      rejected,
      rented,
    })),
  ]);

  const totalPages = Math.ceil(total / limit);

  const statusTabs = [
    { value: "pending", label: "Pending", count: stats.pending },
    { value: "active", label: "Live", count: stats.active },
    { value: "rented", label: "Rented", count: stats.rented },
    { value: "rejected", label: "Rejected", count: stats.rejected },
  ] as const;

  const serialized = properties.map((p) => ({
    _id: String(p._id),
    title: p.title,
    description: p.description,
    city: p.city,
    district: p.district,
    propertyType: p.propertyType,
    listingMode: p.listingMode,
    price: p.price,
    rooms: p.rooms,
    bathrooms: p.bathrooms,
    images: p.images,
    amenities: p.amenities,
    status: p.status,
    landlord: {
      _id: String((p.landlord as { _id: unknown })._id ?? p.landlord),
      name: (p.landlord as { name: string }).name,
      email: (p.landlord as { email?: string }).email ?? "",
      phone: (p.landlord as { phone?: string }).phone,
    },
    createdAt: p.createdAt.toISOString(),
  }));

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Property Moderation</h1>
        <p className="mt-2 text-slate-600">
          Landlords' property listings require admin approval before becoming Live.
        </p>
      </div>

      <div className="mb-8 border-b border-slate-200">
        <div className="flex gap-8 overflow-x-auto">
          {statusTabs.map((tab) => (
            <Link
              key={tab.value}
              href={`/admin/properties?status=${tab.value}&page=1`}
              className={`whitespace-nowrap border-b-2 px-2 pb-4 text-sm font-medium transition ${
                status === tab.value
                  ? "border-[#0c3d6e] text-[#0c3d6e]"
                  : "border-transparent text-slate-600 hover:text-slate-900"
              }`}
            >
              {tab.label}
              <span className="ml-2 inline-block rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold">
                {tab.count}
              </span>
            </Link>
          ))}
        </div>
      </div>

      <div className="my-6">
        <PropertyModeration properties={serialized} status={status} />
      </div>

      {totalPages > 1 && (
        <div className="mt-8 flex items-center justify-center gap-2">
          {page > 1 && (
            <Link
              href={`/admin/properties?status=${status}&page=${page - 1}`}
              className="rounded-lg border border-slate-200 px-4 py-2 hover:bg-slate-50"
            >
              ← Previous
            </Link>
          )}
          <span className="text-sm text-slate-600">
            Page {page} of {totalPages}
          </span>
          {page < totalPages && (
            <Link
              href={`/admin/properties?status=${status}&page=${page + 1}`}
              className="rounded-lg border border-slate-200 px-4 py-2 hover:bg-slate-50"
            >
              Next →
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
