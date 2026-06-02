"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Send, Loader } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface BookingRequestFormProps {
  propertyId: string;
  propertyTitle: string;
  landlordName: string;
  onSuccess?: () => void;
}

export function BookingRequestForm({
  propertyId,
  propertyTitle,
  landlordName,
  onSuccess,
}: BookingRequestFormProps) {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          propertyId,
          inquiryMessage: message,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "An error occurred");
        return;
      }

      setSuccess(true);
      setMessage("");
      setTimeout(() => {
        if (onSuccess) onSuccess();
        router.refresh();
      }, 2000);
    } catch (err) {
      setError("A system error occurred");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="rounded-lg bg-green-50 p-4 text-center">
        <p className="text-green-800 font-semibold">
          ✓ Request sent successfully!
        </p>
        <p className="text-sm text-green-700 mt-1">
          {landlordName} will respond to you shortly.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-lg border border-slate-200 p-5 bg-white">
      <div>
        <h3 className="font-semibold text-slate-900">
          Request to rent {propertyTitle}
        </h3>
        <p className="text-sm text-slate-600 mt-1">
          Send a message to {landlordName}
        </p>
      </div>

      <div>
        <label htmlFor="message" className="block text-sm font-medium text-slate-700 mb-2">
          Your message (e.g. introduce yourself, state your intent)
        </label>
        <textarea
          id="message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Example: I am a university student looking for a room..."
          rows={4}
          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#0c3d6e] focus:border-transparent"
          required
          minLength={5}
          disabled={loading}
        />
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      )}

      <Button
        type="submit"
        disabled={loading || message.trim().length < 5}
        className="w-full flex items-center justify-center gap-2 bg-[#0c3d6e] hover:bg-[#0a2d54]"
      >
        {loading ? (
          <>
            <Loader className="h-4 w-4 animate-spin" />
            Sending...
          </>
        ) : (
          <>
            <Send className="h-4 w-4" />
            Send Request
          </>
        )}
      </Button>

      <p className="text-xs text-slate-500 text-center">
        The landlord can accept or reject the request within 24 hours.
      </p>
    </form>
  );
}
