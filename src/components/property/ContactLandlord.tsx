"use client";

import { useState } from "react";
import Link from "next/link";
import { User, Info } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface ContactLandlordProps {
  propertyId: string;
  isLoggedIn: boolean;
  landlordPhone?: string;
}

export function ContactLandlord({
  propertyId,
  isLoggedIn,
  landlordPhone,
}: ContactLandlordProps) {
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);

  async function sendMessage() {
    setError("");
    const res = await fetch("/api/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ propertyId, content: message }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "An error occurred");
      return;
    }
    setSent(true);
    setMessage("");
  }

  if (!isLoggedIn) {
    return (
      <div className="mt-6 space-y-3">
        <Link 
          href={`/auth/register?redirect=/properties/${propertyId}`}
          className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#0c3d6e] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#0a3259] shadow-sm"
        >
          <User className="h-4 w-4" />
          Register to Contact
        </Link>
        <p className="text-center text-xs text-slate-500">
          Create an account to contact the landlord
        </p>
      </div>
    );
  }

  return (
    <div className="mt-6 space-y-3">
      {sent ? (
        <p className="rounded-lg bg-green-50 px-3 py-2 text-sm text-green-800">
          Message sent successfully!
        </p>
      ) : showForm ? (
        <>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={3}
            placeholder="Write your message here..."
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
          />
          {error && <p className="text-xs text-red-600">{error}</p>}
          <Button fullWidth onClick={sendMessage} disabled={message.length < 5}>
            Send Message
          </Button>
        </>
      ) : (
        <>
          <Button fullWidth className="gap-2" onClick={() => setShowForm(true)}>
            <User className="h-4 w-4" />
            Contact Landlord
          </Button>
          {landlordPhone && (
            <Button
              variant="secondary"
              fullWidth
              className="gap-2"
              onClick={() => window.open(`tel:${landlordPhone}`)}
            >
              <Info className="h-4 w-4" />
              Call: {landlordPhone}
            </Button>
          )}
        </>
      )}
    </div>
  );
}
