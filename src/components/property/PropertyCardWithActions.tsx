"use client";

import Image from "next/image";
import Link from "next/link";
import { MapPin, Bed, Bath, Maximize, Edit, Trash2, Home } from "lucide-react";
import type { PropertyDTO } from "@/types";
import { useState } from "react";
import { useRouter } from "next/navigation";

interface PropertyCardWithActionsProps {
  property: PropertyDTO;
  onDelete?: (id: string) => void;
}

export function PropertyCardWithActions({
  property,
  onDelete,
}: PropertyCardWithActionsProps) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);
  const [toggling, setToggling] = useState(false);

  const handleToggleStatus = async () => {
    if (toggling) return;
    setToggling(true);
    try {
      const response = await fetch(`/api/properties/${property._id}/rent`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: property.status === "rented" ? "active" : "rented" }),
      });

      if (response.ok) {
        router.refresh();
      } else {
        const err = await response.json();
        alert(err.error || "Failed to update property status");
      }
    } catch (error) {
      console.error("Failed to toggle status:", error);
    } finally {
      setToggling(false);
    }
  };

  const image =
    property.images[0] ||
    "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=600&q=80";
  const tag = property.listingMode === "rooms_available" ? "Room" : "Rent";

  const isRented = property.status === "rented";
  const isPending = property.status === "pending";
  const isRejected = property.status === "rejected";

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this property?")) return;

    setDeleting(true);
    try {
      const response = await fetch(`/api/properties/${property._id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        onDelete?.(property._id as string);
        router.refresh();
      }
    } catch (error) {
      console.error("Failed to delete property:", error);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div
      className={`group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md relative ${isRented ? "opacity-75" : isRejected ? "opacity-60" : ""}`}
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        <Image
          src={image}
          alt={property.title}
          fill
          className="object-cover transition group-hover:scale-105"
          sizes="(max-width:768px) 100vw, 33vw"
        />
        <span
          className={`absolute left-3 top-3 rounded-full px-3 py-1 text-xs font-semibold text-white shadow-sm ${
            isRented
              ? "bg-red-600"
              : isPending
                ? "bg-yellow-600"
                : isRejected
                  ? "bg-gray-600"
                  : "bg-[#0c3d6e]"
          }`}
        >
          {isRented ? "RENTED" : isPending ? "PENDING" : isRejected ? "REJECTED" : tag}
        </span>
      </div>

      <div className="p-4 space-y-3">
        <div>
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
        </div>

        <div className="flex gap-4 text-xs text-slate-500 border-t pt-3">
          <div className="flex items-center gap-1">
            <Bed className="h-4 w-4" />
            {property.rooms} Rooms
          </div>
          <div className="flex items-center gap-1">
            <Bath className="h-4 w-4" />
            {property.bathrooms} Bathrooms
          </div>
          {property.area && (
            <div className="flex items-center gap-1">
              <Maximize className="h-4 w-4" />
              {property.area} m²
            </div>
          )}
        </div>

        {isRejected && property.rejectionReason && (
          <div className="bg-red-50 border border-red-200 rounded p-2 text-xs text-red-700">
            <strong>Rejection reason:</strong> {property.rejectionReason}
          </div>
        )}

        <div className="flex gap-2 border-t pt-3">
          <Link
            href={`/dashboard/my-properties/${property._id}/edit`}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition text-sm font-medium"
          >
            <Edit className="h-4 w-4" />
            Edit
          </Link>

          {isPending && (
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-red-100 text-red-700 rounded hover:bg-red-200 transition text-sm font-medium disabled:opacity-50"
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </button>
          )}

          {(property.status === "active" || property.status === "rented") && (
            <button
              onClick={handleToggleStatus}
              disabled={toggling}
              className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded transition text-sm font-medium disabled:opacity-50 ${
                isRented
                  ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                  : "bg-amber-100 text-amber-700 hover:bg-amber-200"
              }`}
            >
              <Home className="h-4 w-4" />
              {isRented ? "Available" : "Mark Rented"}
            </button>
          )}

          <Link
            href={`/properties/${property._id}`}
            className="flex-1 flex items-center justify-center px-3 py-2 bg-slate-100 text-slate-700 rounded hover:bg-slate-200 transition text-sm font-medium"
          >
            View
          </Link>
        </div>
      </div>
    </div>
  );
}
