"use client";

import { useState, useCallback } from "react";
import { Users, Trash2, Lock, Unlock, Plus, ShieldCheck, RotateCcw, Trash } from "lucide-react";

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  phone?: string;
  blocked?: boolean;
  blockReason?: string;
  accountStatus: "pending" | "approved" | "rejected" | null;
  isDeleted?: boolean;
  createdAt: string;
}

interface UserManagementProps {
  initialUsers: User[];
  deletedUsers: User[];
  stats: {
    total: number;
    admins: number;
    landlords: number;
    tenants: number;
    pendingLandlords: number;
  };
  currentUserRole: "admin" | "super_admin";
}

export function UserManagement({ initialUsers, deletedUsers: initialDeletedUsers, stats, currentUserRole }: UserManagementProps) {
  const [tab, setTab] = useState<"active" | "pending" | "recycle">("active");
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [deletedUsers, setDeletedUsers] = useState<User[]>(initialDeletedUsers);
  const [loading, setLoading] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const [blockModal, setBlockModal] = useState<{ userId: string; name: string } | null>(null);
  const [blockReason, setBlockReason] = useState("");

  const [showCreateAdmin, setShowCreateAdmin] = useState(false);
  const [newAdminForm, setNewAdminForm] = useState({ name: "", email: "", password: "" });
  const [creatingAdmin, setCreatingAdmin] = useState(false);

  const showMsg = (type: "success" | "error", text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 4000);
  };

  const handleBlockWithReason = useCallback(async () => {
    if (!blockModal || !blockReason.trim()) return;
    setLoading(blockModal.userId);
    try {
      const response = await fetch(`/api/admin/users/${blockModal.userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "block", blockReason }),
      });
      if (response.ok) {
        setUsers((prev) =>
          prev.map((u) => u._id === blockModal.userId ? { ...u, blocked: true, blockReason } : u)
        );
        showMsg("success", `"${blockModal.name}" has been blocked.`);
      } else {
        const data = await response.json();
        showMsg("error", data.error);
      }
    } catch {
      showMsg("error", "An error occurred");
    } finally {
      setLoading(null);
      setBlockModal(null);
      setBlockReason("");
    }
  }, [blockModal, blockReason]);

  const handleUnblock = useCallback(async (userId: string) => {
    setLoading(userId);
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "unblock" }),
      });
      if (response.ok) {
        setUsers((prev) => prev.map((u) => u._id === userId ? { ...u, blocked: false, blockReason: undefined } : u));
        showMsg("success", "User has been unblocked.");
      } else {
        const data = await response.json();
        showMsg("error", data.error);
      }
    } catch {
      showMsg("error", "An error occurred");
    } finally {
      setLoading(null);
    }
  }, []);

  const handleDelete = useCallback(async (userId: string, userRole: string) => {
    if (currentUserRole === "admin" && (userRole === "admin" || userRole === "super_admin")) {
      showMsg("error", "A regular admin cannot delete another admin.");
      return;
    }
    if (!confirm("Move this user to the Recycle Bin?")) return;
    setLoading(userId);
    try {
      const response = await fetch(`/api/admin/users/${userId}`, { method: "DELETE" });
      if (response.ok) {
        const moved = users.find((u) => u._id === userId);
        setUsers((prev) => prev.filter((u) => u._id !== userId));
        if (moved) setDeletedUsers((prev) => [{ ...moved, isDeleted: true }, ...prev]);
        showMsg("success", "User moved to Recycle Bin.");
      } else {
        const data = await response.json();
        showMsg("error", data.error);
      }
    } catch {
      showMsg("error", "An error occurred");
    } finally {
      setLoading(null);
    }
  }, [currentUserRole, users]);

  const handleRestore = useCallback(async (userId: string) => {
    setLoading(userId);
    try {
      const response = await fetch(`/api/admin/users/${userId}/restore`, { method: "POST" });
      if (response.ok) {
        const restored = deletedUsers.find((u) => u._id === userId);
        setDeletedUsers((prev) => prev.filter((u) => u._id !== userId));
        if (restored) setUsers((prev) => [{ ...restored, isDeleted: false, blocked: false }, ...prev]);
        showMsg("success", "User successfully restored.");
      } else {
        const data = await response.json();
        showMsg("error", data.error);
      }
    } catch {
      showMsg("error", "An error occurred");
    } finally {
      setLoading(null);
    }
  }, [deletedUsers]);

  const handlePermanentDelete = useCallback(async (userId: string) => {
    if (!confirm("⚠️ This is a PERMANENT deletion. Are you sure? All data will be lost.")) return;
    setLoading(userId);
    try {
      const response = await fetch(`/api/admin/users/${userId}/permanent-delete`, { method: "DELETE" });
      if (response.ok) {
        setDeletedUsers((prev) => prev.filter((u) => u._id !== userId));
        showMsg("success", "User has been permanently deleted.");
      } else {
        const data = await response.json();
        showMsg("error", data.error);
      }
    } catch {
      showMsg("error", "An error occurred");
    } finally {
      setLoading(null);
    }
  }, []);

  const handleApproval = useCallback(async (userId: string, action: "approve" | "reject") => {
    setLoading(userId);
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "account_status", status: action === "approve" ? "approved" : "rejected" }),
      });
      if (response.ok) {
        setUsers((prev) =>
          prev.map((u) => u._id === userId ? { ...u, accountStatus: action === "approve" ? "approved" : "rejected" } : u)
        );
        showMsg("success", action === "approve" ? "Account approved." : "Account rejected.");
      } else {
        const data = await response.json();
        showMsg("error", data.error);
      }
    } catch {
      showMsg("error", "An error occurred");
    } finally {
      setLoading(null);
    }
  }, []);

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreatingAdmin(true);
    try {
      const res = await fetch("/api/admin/users/create-admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newAdminForm),
      });
      const data = await res.json();
      if (res.ok) {
        setUsers((prev) => [data.user, ...prev]);
        showMsg("success", "New Admin created.");
        setShowCreateAdmin(false);
        setNewAdminForm({ name: "", email: "", password: "" });
      } else {
        showMsg("error", data.error);
      }
    } catch {
      showMsg("error", "An error occurred");
    } finally {
      setCreatingAdmin(false);
    }
  };

  const roleBadge = (role: string) => {
    const map: Record<string, string> = {
      super_admin: "bg-violet-100 text-violet-800",
      admin: "bg-purple-100 text-purple-800",
      landlord: "bg-green-100 text-green-800",
      tenant: "bg-orange-100 text-orange-800",
    };
    return map[role] || "bg-gray-100 text-gray-800";
  };

  const renderUserRow = (user: User, isDeleted = false) => (
    <tr key={user._id} className="hover:bg-slate-50">
      <td className="px-5 py-3">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#0c3d6e] text-white font-bold text-sm">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="font-medium text-slate-900">{user.name}</p>
            {user.phone && <p className="text-xs text-slate-500">{user.phone}</p>}
          </div>
        </div>
      </td>
      <td className="px-5 py-3 text-slate-600 text-sm">{user.email}</td>
      <td className="px-5 py-3">
        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${roleBadge(user.role)}`}>
          {user.role === "super_admin" ? "Super Admin" : user.role.charAt(0).toUpperCase() + user.role.slice(1)}
        </span>
      </td>
      <td className="px-5 py-3">
        {isDeleted ? (
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-600">Deleted</span>
        ) : (
          <>
            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${user.blocked ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"}`}>
              {user.blocked ? "Blocked" : "Active"}
            </span>
            {user.role === "landlord" && (
              <span className={`ml-1 px-2.5 py-1 rounded-full text-xs font-semibold ${
                user.accountStatus === "pending" ? "bg-amber-100 text-amber-800" :
                user.accountStatus === "rejected" ? "bg-red-100 text-red-800" :
                user.accountStatus === "approved" ? "bg-blue-100 text-blue-800" :
                "bg-gray-100 text-gray-600"
              }`}>
                {user.accountStatus === "pending" ? "⏳ Pending" :
                 user.accountStatus === "rejected" ? "❌ Rejected" :
                 user.accountStatus === "approved" ? "✅ Approved" :
                 "— Old"}
              </span>
            )}
            {user.blocked && user.blockReason && (
              <p className="text-xs text-red-600 mt-1 max-w-[140px] truncate" title={user.blockReason}>{user.blockReason}</p>
            )}
          </>
        )}
      </td>
      <td className="px-5 py-3 text-slate-500 text-sm">{new Date(user.createdAt).toLocaleDateString()}</td>
      <td className="px-5 py-3">
        <div className="flex items-center gap-1.5 flex-wrap">
          {isDeleted ? (
            <>
              <button
                onClick={() => handleRestore(user._id)}
                disabled={loading === user._id}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded text-xs font-medium bg-green-100 text-green-700 hover:bg-green-200 disabled:opacity-50"
              >
                <RotateCcw className="w-3 h-3" />
                Restore
              </button>
              <button
                onClick={() => handlePermanentDelete(user._id)}
                disabled={loading === user._id}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded text-xs font-medium bg-red-100 text-red-700 hover:bg-red-200 disabled:opacity-50"
              >
                <Trash className="w-3 h-3" />
                Permanent Delete
              </button>
            </>
          ) : (
            <>
              {user.role === "landlord" && (user.accountStatus === "pending" || user.accountStatus === null) && !user.blocked && (
                <>
                  <button onClick={() => handleApproval(user._id, "approve")} disabled={loading === user._id}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded text-xs font-semibold bg-green-600 text-white hover:bg-green-700 disabled:opacity-50">
                    ✓ Approve
                  </button>
                  <button onClick={() => handleApproval(user._id, "reject")} disabled={loading === user._id}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded text-xs font-medium bg-orange-100 text-orange-700 hover:bg-orange-200 disabled:opacity-50">
                    ✕ Reject
                  </button>
                </>
              )}
              {user.blocked ? (
                <button onClick={() => handleUnblock(user._id)} disabled={loading === user._id}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded text-xs font-medium bg-yellow-100 text-yellow-700 hover:bg-yellow-200 disabled:opacity-50">
                  <Unlock className="w-3.5 h-3.5" /> Unblock
                </button>
              ) : (
                user.role !== "super_admin" && !(currentUserRole === "admin" && user.role === "admin") && (
                  <button onClick={() => setBlockModal({ userId: user._id, name: user.name })} disabled={loading === user._id}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded text-xs font-medium bg-slate-100 text-slate-700 hover:bg-slate-200 disabled:opacity-50">
                    <Lock className="w-3.5 h-3.5" /> Block
                  </button>
                )
              )}
              {user.role !== "super_admin" && !(currentUserRole === "admin" && (user.role === "admin" || user.role === "super_admin")) && (
                <button onClick={() => handleDelete(user._id, user.role)} disabled={loading === user._id}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded text-xs font-medium bg-red-100 text-red-700 hover:bg-red-200 disabled:opacity-50">
                  <Trash2 className="w-3.5 h-3.5" /> Delete
                </button>
              )}
            </>
          )}
        </div>
      </td>
    </tr>
  );

  const pendingUsers = users.filter(u => u.role === "landlord" && u.accountStatus === "pending");

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { label: "Total", value: stats.total, color: "blue" },
          { label: "Admins", value: stats.admins, color: "purple" },
          { label: "Landlords", value: stats.landlords, color: "green" },
          { label: "Tenants", value: stats.tenants, color: "orange" },
        ].map(({ label, value, color }) => (
          <div key={label} className={`bg-${color}-50 p-4 rounded-xl border border-${color}-100`}>
            <p className="text-sm text-gray-600">{label}</p>
            <p className={`text-2xl font-bold text-${color}-600`}>{value}</p>
          </div>
        ))}
        <div
          onClick={() => setTab("pending")}
          className={`relative cursor-pointer p-4 rounded-xl border transition-all ${
            stats.pendingLandlords > 0
              ? "bg-amber-50 border-amber-300 hover:bg-amber-100"
              : "bg-gray-50 border-gray-100"
          }`}
        >
          {stats.pendingLandlords > 0 && (
            <span className="absolute top-2 right-2 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
            </span>
          )}
          <p className="text-sm text-gray-600">Pending</p>
          <p className={`text-2xl font-bold ${
            stats.pendingLandlords > 0 ? "text-amber-600" : "text-gray-400"
          }`}>{stats.pendingLandlords}</p>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex gap-1 rounded-xl bg-slate-100 p-1">
          <button
            onClick={() => setTab("active")}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-all ${tab === "active" ? "bg-white shadow text-[#0c3d6e]" : "text-slate-500 hover:text-slate-700"}`}
          >
            <Users className="h-4 w-4" />
            Users ({users.length})
          </button>
          <button
            onClick={() => setTab("pending")}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-all ${tab === "pending" ? "bg-white shadow text-amber-600" : "text-slate-500 hover:text-slate-700"}`}
          >
            ⏳ Pending
            {pendingUsers.length > 0 && (
              <span className="rounded-full bg-amber-500 px-2 py-0.5 text-xs text-white">{pendingUsers.length}</span>
            )}
          </button>
          <button
            onClick={() => setTab("recycle")}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-all ${tab === "recycle" ? "bg-white shadow text-red-600" : "text-slate-500 hover:text-slate-700"}`}
          >
            <Trash2 className="h-4 w-4" />
            Recycle Bin {deletedUsers.length > 0 && <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs text-red-700">{deletedUsers.length}</span>}
          </button>
        </div>
        {tab === "active" && currentUserRole === "super_admin" && (
          <button
            onClick={() => setShowCreateAdmin(true)}
            className="flex items-center gap-2 rounded-lg bg-[#0c3d6e] px-4 py-2 text-sm font-semibold text-white hover:bg-[#0a2e53]"
          >
            <Plus className="h-4 w-4" />
            New Admin
          </button>
        )}
      </div>

      {message && (
        <div className={`p-3 rounded-lg text-sm font-medium ${message.type === "success" ? "bg-green-50 text-green-800 border border-green-200" : "bg-red-50 text-red-800 border border-red-200"}`}>
          {message.text}
          <button onClick={() => setMessage(null)} className="ml-2 opacity-60 hover:opacity-100">✕</button>
        </div>
      )}

      {tab === "recycle" && (
        <div className="rounded-xl bg-amber-50 border border-amber-200 p-4 text-sm text-amber-800">
          <strong>Recycle Bin:</strong> Users here can be restored or permanently deleted. Permanent deletion cannot be undone.
        </div>
      )}

      {tab === "pending" && pendingUsers.length > 0 && (
        <div className="rounded-xl bg-amber-50 border border-amber-300 p-4 text-sm text-amber-800">
          <strong>⏳ {pendingUsers.length} Landlords</strong> are waiting for your approval. Click <strong>Approve</strong> or <strong>Reject</strong>.
        </div>
      )}
      {tab === "pending" && pendingUsers.length === 0 && (
        <div className="rounded-xl bg-green-50 border border-green-200 p-4 text-sm text-green-800">
          ✅ No pending requests found. All landlords are approved.
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-slate-200">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              {["Name", "Email", "Role", "Status", "Date", "Actions"].map((h) => (
                <th key={h} className="px-5 py-3 text-left font-semibold text-slate-700">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {tab === "active"
              ? users.map((u) => renderUserRow(u, false))
              : tab === "pending"
              ? pendingUsers.map((u) => renderUserRow(u, false))
              : deletedUsers.map((u) => renderUserRow(u, true))}
          </tbody>
        </table>
        {tab === "active" && users.length === 0 && (
          <div className="py-12 text-center text-slate-500">No users found</div>
        )}
        {tab === "pending" && pendingUsers.length === 0 && (
          <div className="py-12 text-center text-slate-500">No pending requests found</div>
        )}
        {tab === "recycle" && deletedUsers.length === 0 && (
          <div className="py-12 text-center text-slate-500">
            <Trash2 className="mx-auto mb-2 h-8 w-8 text-slate-300" />
            Recycle Bin is empty
          </div>
        )}
      </div>

      {blockModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-slate-900 mb-2">Block User: {blockModal.name}</h3>
            <p className="text-sm text-slate-600 mb-4">Please provide a reason for blocking this user. They will see this message.</p>
            <textarea
              rows={3}
              value={blockReason}
              onChange={(e) => setBlockReason(e.target.value)}
              placeholder="Reason for blocking..."
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-[#0c3d6e]"
            />
            <div className="mt-4 flex gap-3">
              <button onClick={() => { setBlockModal(null); setBlockReason(""); }}
                className="flex-1 py-2 text-sm font-medium border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-50">
                Cancel
              </button>
              <button onClick={handleBlockWithReason} disabled={!blockReason.trim() || loading !== null}
                className="flex-1 py-2 text-sm font-medium rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:opacity-50">
                Block User
              </button>
            </div>
          </div>
        </div>
      )}

      {showCreateAdmin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <ShieldCheck className="h-6 w-6 text-[#0c3d6e]" />
              <h3 className="text-lg font-bold text-slate-900">Create New Admin</h3>
            </div>
            <form onSubmit={handleCreateAdmin} className="space-y-4">
              <input type="text" required placeholder="Admin Name" value={newAdminForm.name}
                onChange={(e) => setNewAdminForm((p) => ({ ...p, name: e.target.value }))}
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-[#0c3d6e]" />
              <input type="email" required placeholder="Email" value={newAdminForm.email}
                onChange={(e) => setNewAdminForm((p) => ({ ...p, email: e.target.value }))}
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-[#0c3d6e]" />
              <input type="password" required placeholder="Password" value={newAdminForm.password}
                onChange={(e) => setNewAdminForm((p) => ({ ...p, password: e.target.value }))}
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-[#0c3d6e]" />
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowCreateAdmin(false)}
                  className="flex-1 py-2 text-sm font-medium border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-50">
                  Cancel
                </button>
                <button type="submit" disabled={creatingAdmin}
                  className="flex-1 py-2 text-sm font-semibold rounded-lg bg-[#0c3d6e] text-white hover:bg-[#0a2e53] disabled:opacity-50">
                  {creatingAdmin ? "Creating..." : "Create Admin"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
