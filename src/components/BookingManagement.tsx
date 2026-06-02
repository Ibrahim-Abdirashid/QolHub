"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, X, Loader, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface Booking {
  _id: string;
  property: { title: string; price: number };
  tenant: { _id: string; name: string; email: string; phone?: string };
  inquiryMessage: string;
  landlordResponse?: string;
  status: "pending" | "approved" | "rejected" | "completed";
  createdAt: string;
}

interface BookingManagementProps {
  bookings: Booking[];
}

export function BookingManagement({ bookings }: BookingManagementProps) {
  const router = useRouter();
  const [processing, setProcessing] = useState<string | null>(null);
  const [response, setResponse] = useState<{ [key: string]: string }>({});
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const handleResponse = async (
    bookingId: string,
    action: "approve" | "reject"
  ) => {
    setProcessing(bookingId);
    try {
      const res = await fetch(`/api/bookings/${bookingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          response: response[bookingId] || "",
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        alert(error.error || "An error occurred");
        return;
      }

      setResponse({ ...response, [bookingId]: "" });
      setExpandedId(null);
      router.refresh();
    } catch (err) {
      console.error(err);
      alert("A system error occurred");
    } finally {
      setProcessing(null);
    }
  };

  const pendingBookings = bookings.filter((b) => b.status === "pending");
  const otherBookings = bookings.filter((b) => b.status !== "pending");

  if (bookings.length === 0) {
    return (
      <div className="rounded-lg border border-slate-200 bg-slate-50 p-8 text-center">
        <MessageSquare className="mx-auto h-12 w-12 text-slate-400 mb-3" />
        <p className="text-slate-600">No booking requests found</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {pendingBookings.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-slate-900 mb-4">
            Pending Requests ({pendingBookings.length})
          </h3>
          <div className="space-y-3">
            {pendingBookings.map((booking) => (
              <div
                key={booking._id}
                className="rounded-lg border border-amber-200 bg-amber-50 p-4"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-semibold text-slate-900">
                      {booking.property.title}
                    </p>
                    <p className="text-sm text-slate-600">
                      Tenant: <span className="font-medium">{booking.tenant.name}</span>
                    </p>
                    <p className="text-sm text-slate-600">
                      Phone: <span className="font-medium">{booking.tenant.phone || "N/A"}</span>
                    </p>
                    <p className="text-sm text-slate-600">
                      Email: <span className="font-medium">{booking.tenant.email}</span>
                    </p>
                  </div>
                  <span className="inline-block rounded-full bg-amber-200 px-3 py-1 text-xs font-semibold text-amber-800">
                    Pending
                  </span>
                </div>

                <div className="mb-4 rounded-lg bg-white p-3">
                  <p className="text-sm text-slate-700">{booking.inquiryMessage}</p>
                  <p className="text-xs text-slate-500 mt-2">
                    {new Date(booking.createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>

                <div
                  className={`space-y-3 ${
                    expandedId === booking._id ? "block" : "hidden"
                  }`}
                >
                  <textarea
                    value={response[booking._id] || ""}
                    onChange={(e) =>
                      setResponse({
                        ...response,
                        [booking._id]: e.target.value,
                      })
                    }
                    placeholder="Your reply (optional)..."
                    rows={2}
                    className="w-full px-2 py-2 border border-slate-300 rounded text-sm"
                  />
                </div>

                <div className="flex gap-2 mt-4">
                  <Button
                    onClick={() =>
                      handleResponse(booking._id, "approve")
                    }
                    disabled={processing === booking._id}
                    className="flex-1 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700"
                  >
                    {processing === booking._id ? (
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
                    onClick={() => handleResponse(booking._id, "reject")}
                    disabled={processing === booking._id}
                    className="flex-1 flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700"
                  >
                    {processing === booking._id ? (
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
                  <button
                    onClick={() =>
                      setExpandedId(
                        expandedId === booking._id ? null : booking._id
                      )
                    }
                    className="px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded"
                  >
                    {expandedId === booking._id ? "Cancel Reply" : "Reply"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {otherBookings.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-slate-900 mb-4">
            Other Requests ({otherBookings.length})
          </h3>
          <div className="space-y-3">
            {otherBookings.map((booking) => (
              <div
                key={booking._id}
                className="rounded-lg border border-slate-200 bg-white p-4"
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-semibold text-slate-900">
                      {booking.property.title}
                    </p>
                    <p className="text-sm text-slate-600">
                      {booking.tenant.name}
                    </p>
                  </div>
                  <span
                    className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${
                      booking.status === "approved"
                        ? "bg-green-100 text-green-800"
                        : booking.status === "rejected"
                        ? "bg-red-100 text-red-800"
                        : "bg-slate-100 text-slate-800"
                    }`}
                  >
                    {booking.status === "approved"
                      ? "Approved"
                      : booking.status === "rejected"
                      ? "Rejected"
                      : "Completed"}
                  </span>
                </div>
                <p className="text-sm text-slate-700">{booking.inquiryMessage}</p>
                {booking.landlordResponse && (
                  <div className="mt-2 rounded-lg bg-slate-50 p-2">
                    <p className="text-xs font-medium text-slate-600">
                      Your Response:
                    </p>
                    <p className="text-sm text-slate-700">
                      {booking.landlordResponse}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
