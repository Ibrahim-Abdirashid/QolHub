"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { Home } from "lucide-react";
import type { PropertyDTO } from "@/types";

export function ActiveProperties({
  properties,
}: {
  properties: PropertyDTO[];
}) {
  const router = useRouter();

  async function handleMarkAsRented(id: string) {
    if (!confirm("Are you sure you want to mark this property as rented?")) {
      return;
    }
    
    const res = await fetch(`/api/properties/${id}/rent`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });
    
    if (!res.ok) {
      const data = await res.json();
      alert(data.error || "An error occurred");
      return;
    }
    
    router.refresh();
  }

  if (properties.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-slate-500">
        No active properties
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
            <th className="pb-3 font-medium">Rent</th>
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
              <td className="font-semibold text-[#0c3d6e]">${p.price}/mo</td>
              <td className="text-slate-500" suppressHydrationWarning>
                {new Date(p.createdAt).toLocaleDateString("en-US")}
              </td>
              <td>
                <button
                  type="button"
                  onClick={() => handleMarkAsRented(p._id)}
                  className="flex items-center gap-1 rounded-lg bg-blue-100 px-3 py-2 text-sm text-blue-700 hover:bg-blue-200 transition"
                >
                  <Home className="h-4 w-4" />
                  Mark Rented
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
