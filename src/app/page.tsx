import Image from "next/image";
import Link from "next/link";
import { Search, MapPin, Home, Calendar, Key } from "lucide-react";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { PropertyCard } from "@/components/property/PropertyCard";
import { connectDB } from "@/lib/mongodb";
import { Property } from "@/models/Property";
import { serializeProperty } from "@/lib/api";
import { BOORAMA_DISTRICTS, PROPERTY_TYPES } from "@/lib/constants";

async function getLatestProperties() {
  try {
    await connectDB();
    const list = await Property.find({ status: "active", city: "Boorama" })
      .populate("landlord", "name phone avatar")
      .sort({ createdAt: -1 })
      .limit(3)
      .lean();
    return list.map((p) => serializeProperty(p as Record<string, unknown>));
  } catch (error) {
    console.error("Failed to fetch properties:", error);
    return [];
  }
}

export default async function HomePage() {
  const properties = await getLatestProperties();

  return (
    <PublicLayout>
      {/* Hero */}
      <section className="relative min-h-[520px] overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1600&q=80"
          alt="Modern house"
          fill
          priority
          className="object-cover"
        />
        <div className="absolute inset-0 bg-[#0c3d6e]/70" />
        <div className="relative mx-auto max-w-7xl px-4 py-24 text-white lg:px-8 lg:py-32">
          <h1 className="max-w-2xl text-4xl font-bold leading-tight md:text-5xl">
            Find Your Dream Home in{" "}
            <span className="text-sky-300">Boorama</span>
          </h1>
          <p className="mt-4 max-w-xl text-lg text-sky-100">
            Search for a complete house or room for rent in Boorama. Students, families, and visitors — all in one place.
          </p>

          <form
            action="/properties"
            className="mt-10 flex max-w-3xl flex-col gap-3 rounded-2xl bg-white p-3 shadow-xl sm:flex-row sm:items-center"
          >
            <div className="flex flex-1 items-center gap-2 rounded-xl bg-slate-50 px-4 py-3">
              <MapPin className="h-5 w-5 text-slate-400" />
              <select
                name="district"
                defaultValue=""
                className="w-full bg-transparent text-sm text-slate-800 outline-none"
              >
                <option value="">All Districts</option>
                {BOORAMA_DISTRICTS.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div className="flex flex-1 items-center gap-2 rounded-xl bg-slate-50 px-4 py-3">
              <Home className="h-5 w-5 text-slate-400" />
              <select
                name="type"
                className="w-full bg-transparent text-sm text-slate-800 outline-none"
              >
                <option value="">Property Type</option>
                {PROPERTY_TYPES.map((tItem) => (
                  <option key={tItem.value} value={tItem.value}>
                    {tItem.label}
                  </option>
                ))}
              </select>
            </div>
            <button
              type="submit"
              className="flex items-center justify-center gap-2 rounded-xl bg-[#0c3d6e] px-8 py-3 text-sm font-semibold text-white hover:bg-[#0a3259]"
            >
              <Search className="h-4 w-4" />
              Search
            </button>
          </form>
        </div>
      </section>

      {/* Latest Properties */}
      <section className="mx-auto max-w-7xl px-4 py-16 lg:px-8">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Latest Properties</h2>
            <p className="mt-1 text-slate-600">New verified properties ready for rent</p>
          </div>
          <Link href="/properties" className="text-sm font-semibold text-[#0c3d6e] hover:underline">
            View all →
          </Link>
        </div>

        {properties.length > 0 ? (
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {properties.map((p) => (
              <PropertyCard key={p._id} property={p} />
            ))}
          </div>
        ) : (
          <div className="mt-8 rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
            <p className="text-slate-600">
              No properties available right now. Please check back later.
            </p>
          </div>
        )}
      </section>

      {/* How It Works */}
      <section className="bg-white py-16">
        <div className="mx-auto max-w-7xl px-4 text-center lg:px-8">
          <h2 className="text-2xl font-bold">How It Works</h2>
          <p className="mt-2 text-slate-600">Three simple steps to find your home</p>
          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {[
              { icon: Search, step: "1. Search Your Home", desc: "Search by district and property type" },
              { icon: Calendar, step: "2. Visit the Property", desc: "View details and photos" },
              { icon: Key, step: "3. Move In", desc: "Contact the landlord and rent" },
            ].map(({ icon: Icon, step, desc }) => (
              <div key={step} className="flex flex-col items-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-accent">
                  <Icon className="h-7 w-7 text-[#0c3d6e]" />
                </div>
                <h3 className="mt-4 font-semibold">{step}</h3>
                <p className="mt-2 text-sm text-slate-600">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-4 pb-16 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-6 rounded-2xl bg-[#0c3d6e] p-10 text-white md:flex-row">
          <div>
            <h2 className="text-2xl font-bold">Do you have a house to rent out?</h2>
            <p className="mt-2 text-sky-100">
              List your property on QolHub and connect with tenants in Boorama.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/auth/register?role=landlord"
              className="rounded-lg bg-white px-6 py-3 text-sm font-semibold text-[#0c3d6e]"
            >
              List Your Property
            </Link>
            <Link
              href="/help"
              className="rounded-lg border border-white/50 px-6 py-3 text-sm font-semibold hover:bg-white/10"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
