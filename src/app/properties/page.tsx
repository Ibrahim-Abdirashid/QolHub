import Link from "next/link";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { PropertyCard } from "@/components/property/PropertyCard";
import { connectDB } from "@/lib/mongodb";
import { Property } from "@/models/Property";
import { serializeProperty } from "@/lib/api";
import { BOORAMA_DISTRICTS, PROPERTY_TYPES, LISTING_MODES } from "@/lib/constants";

interface PageProps {
  searchParams: Promise<{ district?: string; type?: string; listingMode?: string }>;
}

export default async function PropertiesPage({ searchParams }: PageProps) {
  const params = await searchParams;

  const filter: Record<string, unknown> = { status: "active", city: "Boorama" };
  if (params.district) filter.district = new RegExp(params.district, "i");
  if (params.type) filter.propertyType = params.type;
  if (params.listingMode) filter.listingMode = params.listingMode;

  let properties: ReturnType<typeof serializeProperty>[] = [];
  try {
    await connectDB();
    const list = await Property.find(filter)
      .populate("landlord", "name phone avatar")
      .sort({ createdAt: -1 })
      .limit(24)
      .lean();
    properties = list.map((p) => serializeProperty(p as Record<string, unknown>));
  } catch {
    /* database optional during dev */
  }

  return (
    <PublicLayout>
      <div className="mx-auto max-w-7xl px-4 py-8 lg:px-8">
        <nav className="text-sm text-slate-500">
          <Link href="/" className="hover:text-[#0c3d6e]">Home</Link>
          <span className="mx-2">›</span>
          <span className="text-slate-800">Properties</span>
        </nav>

        <h1 className="mt-4 text-3xl font-bold text-slate-900">Properties</h1>
        <p className="mt-2 text-slate-600">
          Find a complete house or vacant room in Boorama
        </p>

        <form method="get" className="mt-8 flex flex-wrap gap-3 rounded-2xl border border-slate-200 bg-white p-4">
          <select
            name="district"
            defaultValue={params.district || ""}
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
          >
            <option value="">All Districts</option>
            {BOORAMA_DISTRICTS.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
          <select
            name="type"
            defaultValue={params.type || ""}
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
          >
            <option value="">Property Type</option>
            {PROPERTY_TYPES.map((item) => (
              <option key={item.value} value={item.value}>{item.label}</option>
            ))}
          </select>
          <select
            name="listingMode"
            defaultValue={params.listingMode || ""}
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
          >
            <option value="">All listing types</option>
            {LISTING_MODES.map((m) => (
              <option key={m.value} value={m.value}>{m.label}</option>
            ))}
          </select>
          <button
            type="submit"
            className="rounded-lg bg-[#0c3d6e] px-5 py-2 text-sm font-semibold text-white"
          >
            Search
          </button>
        </form>

        {properties.length > 0 ? (
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {properties.map((p) => (
              <PropertyCard key={p._id} property={p} />
            ))}
          </div>
        ) : (
          <p className="mt-12 text-center text-slate-500">
            No properties found. Try a different filter.
          </p>
        )}
      </div>
    </PublicLayout>
  );
}
