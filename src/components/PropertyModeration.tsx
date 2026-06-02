"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Check,
  X,
  Trash2,
  Loader,
  MessageSquare,
  MapPin,
  Home,
  Bed,
  Bath,
} from "lucide-react";
import { Button } from "@/components/ui/Button";

interface Property {
  _id: string;
  title: string;
  description: string;
  city: string;
  district: string;
  propertyType: "full_house" | "apartment" | "room";
  listingMode: "entire_available" | "rooms_available";
  price: number;
  rooms: number;
  bathrooms: number;
  images: string[];
  amenities: string[];
  status: "pending" | "active" | "rejected" | "rented";
  landlord: { _id: string; name: string; email: string; phone?: string };
  createdAt: string;
}

interface PropertyModerationProps {
  properties: Property[];
  status: "pending" | "active" | "rejected" | "rented";
}

export function PropertyModeration({
  properties,
  status,
}: PropertyModerationProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [processing, setProcessing] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState<{
    [key: string]: string;
  }>({});
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const handleModerate = async (
    propertyId: string,
    action: "approve" | "reject" | "delete"
  ) => {
    setProcessing(propertyId);
    try {
      const res = await fetch(`/api/admin/properties/${propertyId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          reason: rejectionReason[propertyId] || "",
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        alert(error.error || "An error occurred");
        setProcessing(null);
        return;
      }

      setRejectionReason({ ...rejectionReason, [propertyId]: "" });
      setExpandedId(null);
      
      startTransition(() => {
        router.refresh();
        setProcessing(null);
      });
    } catch (err) {
      console.error(err);
      alert("A system error occurred");
      setProcessing(null);
    }
  };

  return (
    <div className="space-y-4 notranslate" translate="no">
      {properties.length === 0 ? (
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-8 text-center">
          <Home className="mx-auto h-12 w-12 text-slate-400 mb-3" />
          <p className="text-slate-600">
            {status === "pending"
              ? "No pending properties"
              : `No ${status} properties`}
          </p>
        </div>
      ) : (
        properties.map((property) => (
          <div
            key={property._id}
            className={`rounded-lg border p-4 ${
              status === "pending"
                ? "border-amber-200 bg-amber-50"
                : status === "active"
                ? "border-green-200 bg-green-50"
                : status === "rejected"
                ? "border-red-200 bg-red-50"
                : "border-slate-200 bg-slate-50"
            } ${isPending && processing === property._id ? "opacity-50 pointer-events-none" : ""}`}
          >
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Property Image */}
              <div className="md:col-span-1">
                {property.images[0] && (
                  <div className="relative w-full aspect-square rounded-lg overflow-hidden bg-slate-200">
                    <img
                      src={property.images[0]}
                      alt={property.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
              </div>

              {/* Property Details */}
              <div className="md:col-span-3">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-slate-900 text-lg">
                      {property.title}
                    </h3>
                    <p className="text-sm text-slate-600">
                      <MapPin className="inline h-3 w-3 mr-1" />
                      {property.district}, {property.city}
                    </p>
                    <p className="text-lg font-bold text-slate-900 mt-2">
                      ${property.price}/month
                    </p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      status === "pending"
                        ? "bg-amber-200 text-amber-800"
                        : status === "active"
                        ? "bg-green-200 text-green-800"
                        : status === "rejected"
                        ? "bg-red-200 text-red-800"
                        : "bg-slate-200 text-slate-800"
                    }`}
                  >
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </span>
                </div>

                {/* Property Info */}
                <div className="flex gap-4 text-sm text-slate-600 mb-3">
                  <span className="flex items-center gap-1">
                    <Bed className="h-4 w-4" />
                    {property.rooms} Rooms
                  </span>
                  <span className="flex items-center gap-1">
                    <Bath className="h-4 w-4" />
                    {property.bathrooms} Bathrooms
                  </span>
                  <span className="inline-block px-2 py-1 bg-slate-200 rounded text-xs font-medium">
                    {property.propertyType}
                  </span>
                </div>

                {/* Landlord Info */}
            <div className="border-t border-slate-200 pt-3 flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-slate-600">
                  Landlord Info:
                </p>
                <p className="text-sm font-semibold text-slate-900">
                  {property.landlord.name}
                </p>
                <p className="text-xs text-slate-600">
                  {property.landlord.email}
                  {property.landlord.phone && ` • ${property.landlord.phone}`}
                </p>
              </div>
              
              {status !== "pending" && status !== "rejected" && (
                 <Link
                   href={`/properties/${property._id}`}
                   target="_blank"
                   className="text-sm font-semibold text-[#0c3d6e] hover:underline"
                 >
                   View Property →
                 </Link>
              )}
            </div>

                {/* Description */}
                <div className="mt-3 p-2 rounded bg-white/50">
                  <p className="text-sm text-slate-700 line-clamp-2">
                    {property.description}
                  </p>
                </div>

                {/* Actions */}
                {status === "pending" && (
                  <div className="mt-4 space-y-3">
                    <div
                      className={`space-y-2 ${
                        expandedId === property._id ? "block" : "hidden"
                      }`}
                    >
                      <textarea
                        value={rejectionReason[property._id] || ""}
                        onChange={(e) =>
                          setRejectionReason({
                            ...rejectionReason,
                            [property._id]: e.target.value,
                          })
                        }
                        placeholder="Reason for rejection (optional)..."
                        rows={2}
                        className="w-full px-3 py-2 border border-slate-300 rounded text-sm"
                      />
                    </div>

                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleModerate(property._id, "approve")}
                        disabled={processing === property._id || isPending}
                        className="flex-1 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700"
                      >
                        {processing === property._id ? (
                          <span className="flex items-center gap-2">
                            <Loader className="h-4 w-4 animate-spin" />
                            Approving...
                          </span>
                        ) : (
                          <span className="flex items-center gap-2">
                            <Check className="h-4 w-4" />
                            Approve
                          </span>
                        )}
                      </Button>
                      <Button
                        onClick={() => handleModerate(property._id, "reject")}
                        disabled={processing === property._id || isPending}
                        className="flex-1 flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700"
                      >
                        {processing === property._id ? (
                          <span className="flex items-center gap-2">
                            <Loader className="h-4 w-4 animate-spin" />
                            Rejecting...
                          </span>
                        ) : (
                          <span className="flex items-center gap-2">
                            <X className="h-4 w-4" />
                            Reject
                          </span>
                        )}
                      </Button>
                      <Link
                        href={`/properties/${property._id}`}
                        target="_blank"
                        className="px-3 py-2 text-sm font-medium text-[#0c3d6e] hover:bg-sky-50 rounded"
                      >
                        View
                      </Link>
                      <button
                        onClick={() =>
                          setExpandedId(
                            expandedId === property._id ? null : property._id
                          )
                        }
                        className="px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200 rounded"
                      >
                        {expandedId === property._id ? "Hide" : "Reason"}
                      </button>
                    </div>
                  </div>
                )}

                {status === "rejected" && (
                  <div className="mt-3">
                    <Button
                      onClick={() => handleModerate(property._id, "delete")}
                      disabled={processing === property._id || isPending}
                      className="w-full flex items-center justify-center gap-2 bg-slate-600 hover:bg-slate-700"
                    >
                      {processing === property._id ? (
                        <span className="flex items-center gap-2">
                          <Loader className="h-4 w-4 animate-spin" />
                          Deleting...
                        </span>
                      ) : (
                        <span className="flex items-center gap-2">
                          <Trash2 className="h-4 w-4" />
                          Delete
                        </span>
                      )}
                    </Button>
                    <Link
                      href={`/properties/${property._id}`}
                      target="_blank"
                      className="w-full flex items-center justify-center gap-2 mt-2 py-2 text-sm font-medium text-[#0c3d6e] border border-[#0c3d6e] hover:bg-sky-50 rounded"
                    >
                      View Property
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
