import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Building2, Users, Wallet, Clock } from "lucide-react";
import { getSession } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import { Property } from "@/models/Property";
import { User } from "@/models/User";
import { AddPropertyForm } from "@/components/property/AddPropertyForm";
import { serializeProperty } from "@/lib/api";

export default async function DashboardPage() {
  const session = await getSession();
  if (session?.role === "tenant") {
    redirect("/dashboard/bookings");
  }

  await connectDB();
  const dbUser = await User.findById(session!.id).select("accountStatus").lean();
  const accountStatus = dbUser?.accountStatus || session?.accountStatus;

  let properties: ReturnType<typeof serializeProperty>[] = [];

  try {
    await connectDB();
    const list = await Property.find({ landlord: session!.id })
      .populate("landlord", "name")
      .sort({ createdAt: -1 })
      .limit(4)
      .lean();
    properties = list.map((p) =>
      serializeProperty(p as Record<string, unknown>)
    );
  } catch {
    /* db optional */
  }

  const hasPending = properties.some((p) => p.status === "pending");
  let availableAdmins: { name: string; phone: string; email: string }[] = [];

  if (hasPending) {
    try {
      availableAdmins = await User.find({
        role: "admin",
        blocked: { $ne: true },
      })
        .select("name phone email")
        .lean() as { name: string; phone: string; email: string }[];
    } catch {
      // Ignore
    }
  }

  const stats = [
    { label: "Total Properties", value: properties.length, icon: Building2 },
    { label: "Tenants", value: "—", icon: Users },
    { label: "Monthly Income", value: "$—", icon: Wallet },
    {
      label: "Pending Payments",
      value: "$—",
      icon: Clock,
      highlight: true,
    },
  ];

  return (
    <>
      <header className="border-b border-slate-200 bg-white px-8 py-6">
        <h1 className="text-2xl font-bold">Welcome, Landlord</h1>
        <p className="text-slate-600">
          Manage your properties and rentals from here
        </p>
      </header>

      {hasPending && availableAdmins.length > 0 && (
        <div className="mx-8 mt-6 rounded-xl border border-sky-200 bg-sky-50 p-4">
          <h3 className="font-semibold text-[#0c3d6e]">
            You have properties awaiting approval (Pending)
          </h3>
          <p className="mt-1 text-sm text-sky-800">
            If approval is taking too long, please contact one of the available admins:
          </p>
          <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {availableAdmins.map((admin, idx) => (
              <div key={idx} className="rounded-lg bg-white p-3 shadow-sm border border-sky-100 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-sky-100 font-bold text-[#0c3d6e]">
                  {admin.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">{admin.name}</p>
                  <p className="text-xs text-slate-600">{admin.phone || admin.email}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="p-8">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map(({ label, value, icon: Icon, highlight }) => (
            <div
              key={label}
              className={`rounded-2xl border p-5 ${
                highlight
                  ? "border-[#0c3d6e] bg-[#0c3d6e] text-white"
                  : "border-slate-200 bg-white"
              }`}
            >
              <Icon
                className={`h-5 w-5 ${highlight ? "text-sky-200" : "text-[#0c3d6e]"}`}
              />
              <p
                className={`mt-3 text-2xl font-bold ${highlight ? "" : "text-slate-900"}`}
              >
                {value}
              </p>
              <p
                className={`text-sm ${highlight ? "text-sky-200" : "text-slate-500"}`}
              >
                {label}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-2">
          <AddPropertyForm />

          <div>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold">Your Properties</h2>
              <Link
                href="/dashboard/my-properties"
                className="text-sm font-semibold text-[#0c3d6e]"
              >
                View all
              </Link>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {properties.map((p) => (
                <Link
                  key={p._id}
                  href={`/properties/${p._id}`}
                  className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"
                >
                  <div className="relative aspect-video">
                    <Image
                      src={
                        p.images[0] ||
                        "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400&q=80"
                      }
                      alt={p.title}
                      fill
                      className="object-cover"
                    />
                    <span className="absolute right-2 top-2 rounded bg-[#0c3d6e] px-2 py-0.5 text-xs font-bold text-white">
                      ${p.price}/mo
                    </span>
                  </div>
                  <div className="p-3">
                    <p className="font-semibold">{p.title}</p>
                    <p className="text-xs text-slate-500">
                      {p.district}, {p.city}
                    </p>
                    <span
                      className={`mt-2 inline-block rounded px-2 py-0.5 text-xs font-semibold ${
                        p.status === "active"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {p.status === "active" ? "ACTIVE" : "PENDING"}
                    </span>
                  </div>
                </Link>
              ))}
              {accountStatus !== "pending" && (
                <Link
                  href="/dashboard#new-property-form"
                  className="flex min-h-[160px] flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 text-[#0c3d6e] hover:bg-slate-50"
                >
                  <span className="text-3xl">+</span>
                  <span className="mt-2 text-sm font-medium">Add another property</span>
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
