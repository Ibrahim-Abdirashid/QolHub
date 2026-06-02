"use client";

import Image from "next/image";
import Link from "next/link";
import { MapPin, Bed, Bath, Maximize } from "lucide-react";
import type { PropertyDTO } from "@/types";

interface PropertyCardProps {
  property: PropertyDTO;
}

export function PropertyCard({ property }: PropertyCardProps) {
  const image =
    property.images[0] ||
    "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=600&q=80";
  const tag = property.listingMode === "rooms_available" ? "Room" : "Rent";

  const isRented = property.status === "rented";

  return (
    <Link
      href={`/properties/${property._id}`}
      className={`group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md block relative ${isRented ? "opacity-75" : ""}`}
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        <Image
          src={image}
          alt={property.title}
          fill
          className="object-cover transition group-hover:scale-105"
          sizes="(max-width:768px) 100vw, 33vw"
        />
        {isRented ? (
           <span className="absolute left-3 top-3 rounded-full bg-red-600 px-3 py-1 text-xs font-semibold text-white shadow-sm">
             RENTED
           </span>
        ) : (
          <span className="absolute left-3 top-3 rounded-full bg-[#0c3d6e] px-3 py-1 text-xs font-semibold text-white shadow-sm">
            {tag}
          </span>
        )}
      </div>
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-slate-900 group-hover:text-[#0c3d6e]">
            {property.title}
          </h3>
          <p className="shrink-0 font-bold text-[#0c3d6e]">
            ${property.price}
            <span className="text-xs font-normal text-slate-500">/mo</span>
          </p>
        </div>
        <p className="mt-1 flex items-center gap-1 text-sm text-slate-500">
          <MapPin className="h-3.5 w-3.5" />
          {property.district}, {property.city}
        </p>
        <div className="mt-3 flex gap-4 text-xs text-slate-500">
          <span className="flex items-center gap-1">
            <Bed className="h-3.5 w-3.5" />
            {property.rooms} Rooms
          </span>
          <span className="flex items-center gap-1">
            <Bath className="h-3.5 w-3.5" />
            {property.bathrooms} Baths
          </span>
          {property.area && (
            <span className="flex items-center gap-1">
              <Maximize className="h-3.5 w-3.5" />
              {property.area} m²
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
