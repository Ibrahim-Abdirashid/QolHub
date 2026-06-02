"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { Check, X } from "lucide-react";
import type { PropertyDTO } from "@/types";

export function PendingApprovals({
  properties,
}: {
  properties: PropertyDTO[];
}) {
  const router = useRouter();

  async function handleAction(id: string, action: "approve" | "reject") {
    await fetch(`/api/properties/${id}/approve`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    });
    router.refresh();
  }

  if (properties.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-slate-500">
        No pending properties found
      </p>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-100 text-left text-slate-500">
            <th className="pb-3 font-medium">Property</th>
            <th className="pb-3 font-medium">Owner</th>
            <th className="pb-3 font-medium">Date</th>
            <th className="pb-3 font-medium">Actions</th>
          </tr>
        </thead>
        <tbody>
          {properties.map((p) => (
            <tr key={p._id} className="border-b border-slate-50">
              <td className="py-4">
                <div className="flex items-center gap-3">
                  <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg">
                    <Image
                      src={
                        p.images[0] ||
                        "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=100&q=80"
                      }
                      alt=""
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <p className="font-medium">{p.title}</p>
                    <p className="text-xs text-slate-500">
                      {p.district}, {p.city}
                    </p>
                  </div>
                </div>
              </td>
              <td>{p.landlord.name}</td>
              <td className="text-slate-500" suppressHydrationWarning>
                {new Date(p.createdAt).toLocaleDateString("en-US")}
              </td>
              <td>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => handleAction(p._id, "approve")}
                    className="rounded-lg bg-green-100 p-2 text-green-700 hover:bg-green-200"
                    aria-label="Approve"
                  >
                    <Check className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAction(p._id, "reject")}
                    className="rounded-lg bg-red-100 p-2 text-red-700 hover:bg-red-200"
                    aria-label="Reject"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
