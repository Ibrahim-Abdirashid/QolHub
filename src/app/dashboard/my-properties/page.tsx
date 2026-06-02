import Link from "next/link";
import { connectDB } from "@/lib/mongodb";
import { Property } from "@/models/Property";
import { User } from "@/models/User";
import { getSession } from "@/lib/auth";
import { PropertyCardWithActions } from "@/components/property/PropertyCardWithActions";
import { serializeProperty } from "@/lib/api";

export default async function MyPropertiesPage() {
  const session = await getSession();
  let properties: ReturnType<typeof serializeProperty>[] = [];
  let accountStatus: string | undefined;
  if (!session) return <div>Access Denied</div>;

  try {
    await connectDB();
    
    const dbUser = await User.findById(session.id).select("accountStatus").lean();
    accountStatus = (dbUser as { accountStatus?: string } | null)?.accountStatus || session.accountStatus;

    const list = await Property.find({ landlord: session.id })
      .populate("landlord", "name phone avatar")
      .sort({ createdAt: -1 })
      .lean();
    properties = list.map((p) =>
      serializeProperty(p as Record<string, unknown>)
    );
  } catch (err) {
    console.error("Error fetching my properties:", err);
  }

  return (
    <>
      <header className="border-b border-slate-200 bg-white px-8 py-6">
        <h1 className="text-2xl font-bold">My Properties</h1>
        {accountStatus !== "pending" && (
          <Link
            href="/dashboard#new-property-form"
            className="mt-2 inline-block text-sm font-semibold text-[#0c3d6e]"
          >
            + Add new property
          </Link>
        )}
      </header>
      <div className="grid gap-6 p-8 sm:grid-cols-2 lg:grid-cols-3">
        {properties.map((p) => (
          <PropertyCardWithActions key={p._id} property={p} />
        ))}
      </div>
    </>
  );
}
