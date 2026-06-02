"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2, Loader, Inbox } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface Booking {
  _id: string;
  property: { title: string; price: number };
  landlord: { name: string; email: string; phone?: string };
  inquiryMessage: string;
  landlordResponse?: string;
  status: "pending" | "approved" | "rejected" | "completed";
  createdAt: string;
}

interface TenantBookingsProps {
  bookings: Booking[];
}

export function TenantBookings({ bookings }: TenantBookingsProps) {
  const router = useRouter();
  const [deleting, setDeleting] = useState<string | null>(null);

  const handleCancel = async (bookingId: string) => {
    if (!confirm("Are you sure you want to delete this request?")) return;

    setDeleting(bookingId);
    try {
      const res = await fetch(`/api/bookings/${bookingId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const error = await res.json();
        alert(error.error || "An error occurred");
        return;
      }

      router.refresh();
    } catch (err) {
      console.error(err);
      alert("A system error occurred");
    } finally {
      setDeleting(null);
    }
  };

  if (bookings.length === 0) {
    return (
      <div className="rounded-lg border border-slate-200 bg-slate-50 p-8 text-center">
        <Inbox className="mx-auto h-12 w-12 text-slate-400 mb-3" />
        <p className="text-slate-600">No requests found</p>
        <p className="text-sm text-slate-500 mt-2">
          Find a property you like and send a request!
        </p>
      </div>
    );
  }

  const pendingBookings = bookings.filter((b) => b.status === "pending");
  const approvedBookings = bookings.filter((b) => b.status === "approved");
  const rejectedBookings = bookings.filter((b) => b.status === "rejected");

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
                  <div className="flex-1">
                    <p className="font-semibold text-slate-900">
                      {booking.property.title}
                    </p>
                    <p className="text-sm text-slate-600 mt-1">
                      Price: <span className="font-medium">${booking.property.price}/mo</span>
                    </p>
                    <p className="text-sm text-slate-600">
                      Landlord: <span className="font-medium">{booking.landlord.name}</span>
                    </p>
                  </div>
                  <span className="inline-block rounded-full bg-amber-200 px-3 py-1 text-xs font-semibold text-amber-800">
                    ⏳ Pending Response
                  </span>
                </div>

                <div className="rounded-lg bg-white p-3 mb-4">
                  <p className="text-xs text-slate-500 mb-1">Your Request:</p>
                  <p className="text-sm text-slate-700">{booking.inquiryMessage}</p>
                  <p className="text-xs text-slate-500 mt-2">
                    {new Date(booking.createdAt).toLocaleDateString("en-US")}
                  </p>
                </div>

                <Button
                  onClick={() => handleCancel(booking._id)}
                  disabled={deleting === booking._id}
                  className="w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700"
                >
                  {deleting === booking._id ? (
                    <span className="flex items-center gap-2">
                      <Loader className="h-4 w-4 animate-spin" />
                      Deleting...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <Trash2 className="h-4 w-4" />
                      Delete Request
                    </span>
                  )}
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {approvedBookings.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-slate-900 mb-4">
            Approved Requests ({approvedBookings.length})
          </h3>
          <div className="space-y-3">
            {approvedBookings.map((booking) => (
              <div
                key={booking._id}
                className="rounded-lg border border-green-200 bg-green-50 p-4"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-semibold text-slate-900">
                      {booking.property.title}
                    </p>
                    <p className="text-sm text-slate-600">
                      {booking.landlord.name} • {booking.landlord.phone}
                    </p>
                  </div>
                  <span className="inline-block rounded-full bg-green-200 px-3 py-1 text-xs font-semibold text-green-800">
                    ✓ Approved
                  </span>
                </div>

                <div className="rounded-lg bg-white p-3">
                  <p className="text-sm text-slate-700">{booking.inquiryMessage}</p>
                  {booking.landlordResponse && (
                    <div className="mt-3 pt-3 border-t border-slate-200">
                      <p className="text-xs font-medium text-slate-600">
                        Landlord's Response:
                      </p>
                      <p className="text-sm text-slate-700 mt-1">
                        {booking.landlordResponse}
                      </p>
                    </div>
                  )}
                </div>

                <p className="text-xs text-slate-500 mt-3">
                  The landlord has accepted your request. Please contact them via phone or email.
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {rejectedBookings.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-slate-900 mb-4">
            Rejected Requests ({rejectedBookings.length})
          </h3>
          <div className="space-y-3">
            {rejectedBookings.map((booking) => (
              <div
                key={booking._id}
                className="rounded-lg border border-red-200 bg-red-50 p-4"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-semibold text-slate-900">
                      {booking.property.title}
                    </p>
                    <p className="text-sm text-slate-600">
                      {booking.landlord.name}
                    </p>
                  </div>
                  <span className="inline-block rounded-full bg-red-200 px-3 py-1 text-xs font-semibold text-red-800">
                    ✗ Rejected
                  </span>
                </div>

                <div className="rounded-lg bg-white p-3">
                  <p className="text-sm text-slate-700">{booking.inquiryMessage}</p>
                  {booking.landlordResponse && (
                    <div className="mt-3 pt-3 border-t border-slate-200">
                      <p className="text-xs font-medium text-slate-600">
                        Reason:
                      </p>
                      <p className="text-sm text-slate-700 mt-1">
                        {booking.landlordResponse}
                      </p>
                    </div>
                  )}
                </div>

                <p className="text-xs text-slate-500 mt-3">
                  This property request was declined. You can look for another property.
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
