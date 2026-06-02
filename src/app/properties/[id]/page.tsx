import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  MapPin,
  Home,
  Bed,
  Bath,
  Maximize,
  Check,
  Share2,
  Heart,
  Ban,
  Shield
} from "lucide-react";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { BookingRequestForm } from "@/components/BookingRequestForm";
import { ContactLandlord } from "@/components/property/ContactLandlord";
import { AdminPropertyControls } from "@/components/property/AdminPropertyControls";
import { PropertyCard } from "@/components/property/PropertyCard";
import { connectDB } from "@/lib/mongodb";
import { Property } from "@/models/Property";
import { serializeProperty } from "@/lib/api";
import { getSession } from "@/lib/auth";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function PropertyDetailPage({ params }: PageProps) {
  const { id } = await params;
  const session = await getSession();

  await connectDB();
  const doc = await Property.findById(id)
    .populate("landlord", "name email phone avatar")
    .lean();

  if (!doc) notFound();

  const property = serializeProperty(doc as Record<string, unknown>);
  const similar = await Property.find({
    status: "active",
    city: property.city,
    _id: { $ne: id },
  })
    .populate("landlord", "name phone avatar")
    .limit(3)
    .lean();

  const mainImage =
    property.images[0] ||
    "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200&q=80";
  const thumbs = property.images.slice(1, 5);

  const availableLabel =
    property.listingMode === "entire_available"
      ? "Available"
      : `${property.availableRooms ?? 1} rooms available`;

  const isRented = property.status === "rented";

  return (
    <PublicLayout>
      <div className="mx-auto max-w-7xl px-4 py-6 lg:px-8">
        <nav className="text-sm text-slate-500">
          <Link href="/properties">Properties</Link>
          <span className="mx-2">›</span>
          <span>{property.city}</span>
          <span className="mx-2">›</span>
          <span className="text-slate-800">{property.title}</span>
        </nav>

        {isRented && (
          <div className="mt-6 rounded-xl bg-red-50 border border-red-200 p-4 flex items-start gap-4">
            <div className="rounded-full bg-red-100 p-2 text-red-600 mt-1">
               <Ban className="w-6 h-6" />
            </div>
            <div>
               <h2 className="text-lg font-bold text-red-800">Rented</h2>
               <p className="text-red-700">This property has been rented and is no longer available.</p>
            </div>
          </div>
        )}

        {property.status === "pending" && session && (session.role === "admin" || session.role === "super_admin" || session.id === property.landlord._id) && (
          <div className="mt-6 rounded-xl bg-amber-50 border border-amber-200 p-4 flex flex-col md:flex-row items-start gap-4">
            <div className="rounded-full bg-amber-100 p-2 text-amber-600 mt-1 shrink-0">
               <Shield className="w-6 h-6" />
            </div>
            <div className="flex-1">
               <h2 className="text-lg font-bold text-amber-800">This property is pending approval</h2>
               <p className="text-amber-700 mb-3">This property is not live yet. Please wait while the admin verifies it.</p>
               
               {session.id === property.landlord._id && (
                 <div className="bg-white/60 rounded-lg p-3 border border-amber-200/50">
                   <p className="text-sm font-semibold text-amber-900 mb-2">Contact admin if there is a delay:</p>
                   <div className="flex flex-col gap-2">
                     <a href="mailto:admin@qolhub.com" className="text-sm flex items-center gap-2 text-amber-800 hover:text-amber-600">
                       <span className="w-6 h-6 rounded-full bg-amber-200 flex items-center justify-center text-xs">A</span>
                       admin@qolhub.com (Admin)
                     </a>
                     <a href="tel:+252634000000" className="text-sm flex items-center gap-2 text-amber-800 hover:text-amber-600">
                       <span className="w-6 h-6 rounded-full bg-amber-200 flex items-center justify-center text-xs">📞</span>
                       +252 63 400 0000
                     </a>
                   </div>
                 </div>
               )}
            </div>
          </div>
        )}

        {property.status === "rejected" && session && (session.role === "admin" || session.role === "super_admin" || session.id === property.landlord._id) && (
          <div className="mt-6 rounded-xl bg-red-50 border border-red-200 p-4 flex items-start gap-4">
            <div className="rounded-full bg-red-100 p-2 text-red-600 mt-1">
               <Ban className="w-6 h-6" />
            </div>
            <div>
               <h2 className="text-lg font-bold text-red-800">This property was rejected</h2>
               <p className="text-red-700">This property was denied from appearing on the platform.</p>
               {session.id === property.landlord._id && (
                 <div className="mt-3">
                   <p className="text-sm font-semibold text-red-900 mb-1">Contact admin for details:</p>
                   <a href="mailto:admin@qolhub.com" className="text-sm text-red-700 hover:underline">admin@qolhub.com</a>
                 </div>
               )}
            </div>
          </div>
        )}

        <div className="mt-6 grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <div className="grid gap-3 md:grid-cols-[2fr_1fr]">
              <div className="relative aspect-4/3 overflow-hidden rounded-2xl md:row-span-2 md:aspect-auto md:min-h-96">
                <Image
                  src={mainImage}
                  alt={property.title}
                  fill
                  className={`object-cover ${isRented ? "grayscale opacity-80" : ""}`}
                  priority
                />
              </div>
              <div className="grid grid-cols-2 gap-3 md:grid-cols-1">
                {(thumbs.length ? thumbs : [mainImage]).map((src, i) => (
                  <div
                    key={i}
                    className="relative aspect-square overflow-hidden rounded-xl"
                  >
                    <Image src={src} alt="" fill className={`object-cover ${isRented ? "grayscale opacity-80" : ""}`} />
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6 flex items-start justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold">{property.title}</h1>
                <p className="mt-2 flex items-center gap-1 text-slate-600">
                  <MapPin className="h-4 w-4" />
                  {property.district}, {property.city}, Somaliland
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  className="rounded-full border border-slate-200 p-2.5 text-slate-600 hover:bg-slate-50"
                  aria-label="Share"
                >
                  <Share2 className="h-5 w-5" />
                </button>
                <button
                  type="button"
                  className="rounded-full border border-slate-200 p-2.5 text-slate-600 hover:bg-slate-50"
                  aria-label="Favorite"
                >
                  <Heart className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-6 rounded-xl border border-slate-100 bg-slate-50 p-4 text-sm">
              <span className="flex items-center gap-2">
                <Home className="h-4 w-4 text-[#0c3d6e]" />
                {property.propertyType === "room" ? "Single Room" : "Full House"}
              </span>
              <span className="flex items-center gap-2">
                <Bed className="h-4 w-4 text-[#0c3d6e]" />
                {property.rooms} Rooms
              </span>
              <span className="flex items-center gap-2">
                <Bath className="h-4 w-4 text-[#0c3d6e]" />
                {property.bathrooms} Bathrooms
              </span>
              {property.area && (
                <span className="flex items-center gap-2">
                  <Maximize className="h-4 w-4 text-[#0c3d6e]" />
                  {property.area} m²
                </span>
              )}
            </div>

            <section className="mt-8">
              <h2 className="text-lg font-bold">Description</h2>
              <p className="mt-3 leading-relaxed text-slate-600">
                {property.description}
              </p>
            </section>

            {property.amenities.length > 0 && (
              <section className="mt-8">
                <h2 className="text-lg font-bold">Amenities</h2>
                <ul className="mt-4 grid gap-2 sm:grid-cols-2">
                  {property.amenities.map((a) => (
                    <li key={a} className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-[#0c3d6e]" />
                      {a}
                    </li>
                  ))}
                </ul>
              </section>
            )}

            <section className="mt-8">
              <h2 className="text-lg font-bold">Location</h2>
              <div className="mt-4 flex h-48 items-center justify-center rounded-2xl bg-linear-to-br from-sky-100 to-slate-100">
                <MapPin className="h-10 w-10 text-[#0c3d6e]" />
                <span className="ml-2 font-medium">
                  {property.district}, {property.city}
                </span>
              </div>
            </section>
          </div>

          <aside>
            <div className="sticky top-24 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-3xl font-bold text-slate-900">
                ${property.price}
                <span className="text-base font-normal text-slate-500">
                  {" "}
                  /mo
                </span>
              </p>
              
              {!isRented ? (
                <span className="mt-2 inline-block rounded-full bg-accent px-3 py-1 text-xs font-semibold text-[#0c3d6e]">
                  {availableLabel}
                </span>
              ) : (
                <span className="mt-2 inline-block rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700">
                  RENTED
                </span>
              )}

              {session && (session.role === "admin" || session.role === "super_admin") ? (
                <div key="admin-controls">
                  <AdminPropertyControls
                    propertyId={property._id}
                    currentStatus={property.status}
                    landlord={property.landlord as any}
                  />
                </div>
              ) : (
                <div key="user-controls">
                  <div className="mt-6 flex items-center gap-3 border-t border-slate-100 pt-6">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#0c3d6e] text-lg font-bold text-white">
                      {property.landlord.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-semibold">{property.landlord.name}</p>
                      <p className="text-xs text-slate-500">Property Owner</p>
                    </div>
                  </div>

                  {!isRented && (
                    <div className="mt-4">
                      {session && session.role === "tenant" ? (
                        <BookingRequestForm
                          propertyId={property._id}
                          propertyTitle={property.title}
                          landlordName={property.landlord.name}
                        />
                      ) : (
                        <ContactLandlord
                          propertyId={property._id}
                          isLoggedIn={!!session}
                          landlordPhone={property.landlord.phone}
                        />
                      )}
                    </div>
                  )}
                </div>
              )}

              {property.verified && (
                <p className="mt-4 flex items-center gap-1 text-xs text-green-700">
                  <Check className="h-3.5 w-3.5" />
                  Verified and secure property
                </p>
              )}
            </div>

            <div className="mt-4 rounded-2xl bg-[#0c3d6e] p-5 text-white">
              <p className="font-semibold">Need help?</p>
              <Link
                href="/help"
                className="mt-2 inline-block text-sm text-sky-200 hover:underline"
              >
                Contact us now
              </Link>
            </div>
          </aside>
        </div>

        {similar.length > 0 && (
          <section className="mt-16 border-t border-slate-200 pt-12">
            <h2 className="text-xl font-bold">Similar Properties</h2>
            <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {similar.map((p) => (
                <PropertyCard
                  key={String(p._id)}
                  property={serializeProperty(p as Record<string, unknown>)}
                />
              ))}
            </div>
          </section>
        )}
      </div>
    </PublicLayout>
  );
}
