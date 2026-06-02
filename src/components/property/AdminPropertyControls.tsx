"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Shield, Check, X, Phone, Mail, User, MessageSquare, Loader } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface AdminPropertyControlsProps {
  propertyId: string;
  currentStatus: "pending" | "active" | "rejected" | "rented";
  landlord: {
    _id: string;
    name: string;
    email: string;
    phone?: string;
  };
}

export function AdminPropertyControls({
  propertyId,
  currentStatus,
  landlord,
}: AdminPropertyControlsProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [messageSent, setMessageSent] = useState(false);
  const [messageError, setMessageError] = useState("");
  const [sendingMessage, setSendingMessage] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const handleAction = async (action: "approve" | "reject") => {
    if (action === "reject" && !showRejectForm) {
      setShowRejectForm(true);
      return;
    }

    setLoadingAction(action);
    setMessageError("");
    try {
      const res = await fetch(`/api/admin/properties/${propertyId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          reason: action === "reject" ? rejectionReason : "",
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        alert(error.error || "An error occurred");
        setLoadingAction(null);
        return;
      }

      setActionSuccess(action === "approve" ? "Property has been approved and is now live!" : "Property has been rejected and the landlord has been notified.");
      setShowRejectForm(false);
      setRejectionReason("");
      
      startTransition(() => {
        router.refresh();
        setLoadingAction(null);
      });
    } catch (err) {
      console.error(err);
      alert("A system error occurred.");
      setLoadingAction(null);
    }
  };

  const handleSendMessage = async () => {
    if (message.trim().length < 5) {
      setMessageError("Message must be at least 5 characters long");
      return;
    }

    setSendingMessage(true);
    setMessageError("");
    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          propertyId,
          content: message,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        setMessageError(err.error || "Failed to send message.");
        setSendingMessage(false);
        return;
      }

      setMessageSent(true);
      setMessage("");
      setTimeout(() => setMessageSent(false), 5000);
    } catch {
      setMessageError("A network error occurred.");
    } finally {
      setSendingMessage(false);
    }
  };

  const statusLabel = () => {
    const statusMap = {
      pending: { text: "Pending Approval", color: "bg-amber-100 text-amber-800 border-amber-200" },
      active: { text: "Live (Active)", color: "bg-green-100 text-green-800 border-green-200" },
      rejected: { text: "Rejected", color: "bg-red-100 text-red-800 border-red-200" },
      rented: { text: "Rented", color: "bg-slate-100 text-slate-800 border-slate-200" },
    };
    const current = statusMap[currentStatus] || { text: currentStatus, color: "bg-gray-100 text-gray-800" };
    return (
      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${current.color}`}>
        {current.text}
      </span>
    );
  };

  return (
    <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-900 text-white p-6 shadow-xl relative overflow-hidden">
      <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-blue-500/10 rounded-full blur-xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -mb-4 -ml-4 w-24 h-24 bg-amber-500/10 rounded-full blur-xl pointer-events-none" />

      <div className="flex items-center gap-2 border-b border-slate-800 pb-4 mb-4">
        <Shield className="h-5 w-5 text-amber-400" />
        <div>
          <h3 className="font-bold text-slate-100 text-sm tracking-wide uppercase">Admin Control Panel</h3>
          <p className="text-xs text-slate-400">Moderation and Direct Action</p>
        </div>
      </div>

      <div className="flex items-center justify-between mb-5">
        <span className="text-xs text-slate-400">Listing Status:</span>
        {statusLabel()}
      </div>

      {actionSuccess && (
        <div className="mb-4 rounded-lg bg-green-500/10 border border-green-500/20 p-3 text-xs text-green-400 flex items-start gap-2">
          <Check className="h-4 w-4 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">Action successful!</p>
            <p className="opacity-90">{actionSuccess}</p>
          </div>
          <button onClick={() => setActionSuccess(null)} className="ml-auto text-green-400 hover:text-white">✕</button>
        </div>
      )}

      <div className="space-y-3 mb-6 bg-slate-800/40 rounded-xl p-4 border border-slate-800">
        <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wide">Landlord Details</h4>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-white font-bold text-sm">
            {landlord.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="text-sm font-semibold text-white">{landlord.name}</p>
            <p className="text-xs text-slate-400">Landlord Account</p>
          </div>
        </div>
        <div className="space-y-2 pt-2 border-t border-slate-800 text-xs text-slate-300">
          <div className="flex items-center gap-2">
            <Mail className="h-3.5 w-3.5 text-slate-400" />
            <a href={`mailto:${landlord.email}`} className="hover:underline hover:text-blue-400 break-all">
              {landlord.email}
            </a>
          </div>
          {landlord.phone && (
            <div className="flex items-center gap-2">
              <Phone className="h-3.5 w-3.5 text-slate-400" />
              <a href={`tel:${landlord.phone}`} className="hover:underline hover:text-blue-400 font-medium">
                {landlord.phone}
              </a>
            </div>
          )}
        </div>
      </div>

      {currentStatus === "pending" && (
        <div className="space-y-3 mb-6">
          <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wide">Moderation</h4>
          
          {showRejectForm ? (
            <div className="space-y-3 bg-red-950/20 border border-red-500/20 rounded-xl p-3">
              <label className="block">
                <span className="text-xs font-medium text-red-300">Reason for rejection (Optional):</span>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Enter rejection reason here..."
                  rows={2}
                  className="mt-1 w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-200 outline-none focus:border-red-500"
                />
              </label>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowRejectForm(false)}
                  className="flex-1 py-1.5 text-xs border border-slate-700 rounded-lg text-slate-300 hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleAction("reject")}
                  disabled={loadingAction !== null}
                  className="flex-1 py-1.5 text-xs bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold flex items-center justify-center gap-1"
                >
                  {loadingAction === "reject" ? <Loader className="h-3 w-3 animate-spin" /> : <X className="h-3 w-3" />}
                  Confirm Rejection
                </button>
              </div>
            </div>
          ) : (
            <div className="flex gap-3">
              <Button
                onClick={() => handleAction("approve")}
                disabled={loadingAction !== null || isPending}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white text-xs py-2.5 gap-1.5 flex items-center justify-center font-bold"
              >
                {loadingAction === "approve" ? (
                  <Loader className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Check className="h-3.5 w-3.5" />
                )}
                Approve
              </Button>
              <Button
                onClick={() => handleAction("reject")}
                disabled={loadingAction !== null || isPending}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white text-xs py-2.5 gap-1.5 flex items-center justify-center font-bold"
              >
                <X className="h-3.5 w-3.5" />
                Reject
              </Button>
            </div>
          )}
        </div>
      )}

      <div className="border-t border-slate-800 pt-5">
        <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wide mb-3 flex items-center gap-1.5">
          <MessageSquare className="h-3.5 w-3.5 text-blue-400" />
          Direct Message to Landlord
        </h4>
        
        {messageSent ? (
          <p className="rounded-lg bg-green-500/10 border border-green-500/20 px-3 py-2 text-xs text-green-400">
            Your message was sent directly to the landlord! You can communicate via your Dashboard.
          </p>
        ) : (
          <div className="space-y-2">
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={3}
              placeholder="Write a message to the landlord..."
              className="w-full rounded-lg bg-slate-950 border border-slate-800 px-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
            {messageError && <p className="text-[10px] text-red-400">{messageError}</p>}
            <Button
              fullWidth
              onClick={handleSendMessage}
              disabled={sendingMessage || message.trim().length < 5}
              className="gap-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold py-2"
            >
              {sendingMessage ? (
                <Loader className="h-3 w-3 animate-spin" />
              ) : (
                "Send Message"
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
