"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Camera, Save, AlertCircle } from "lucide-react";

interface ProfileEditFormProps {
  initialData: {
    _id: string;
    name: string;
    email: string;
    phone?: string;
    avatar?: string;
    role: string;
  };
}

export function ProfileEditForm({ initialData }: ProfileEditFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    name: initialData.name,
    phone: initialData.phone || "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/users/me/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to update profile");
        return;
      }

      setSuccess(true);
      router.refresh();
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError("An error occurred while updating profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Profile Picture */}
      <div className="flex items-center gap-6">
        <div className="relative">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-3xl font-bold overflow-hidden">
            {initialData.name.charAt(0).toUpperCase()}
          </div>
        </div>

        <div>
          <h3 className="font-semibold text-gray-900">{initialData.name}</h3>
          <p className="text-sm text-gray-500">{initialData.email}</p>
          <p className="text-xs text-gray-400 mt-1">
            {initialData.role.charAt(0).toUpperCase() +
              initialData.role.slice(1)}
          </p>
        </div>
      </div>

      {/* Form Fields */}
      <div className="space-y-4 bg-gray-50 p-6 rounded-lg">
        {error && (
          <div className="flex gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {success && (
          <div className="flex gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
            <span className="text-sm text-green-700">
              ✓ Profile updated successfully
            </span>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Full Name
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email (Read-only)
          </label>
          <input
            type="email"
            value={initialData.email}
            disabled
            className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-500 cursor-not-allowed"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Phone Number
          </label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="e.g., +252 123 456 789"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>


      </div>

      {/* Save Button */}
      <button
        type="submit"
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition font-medium"
      >
        <Save className="w-5 h-5" />
        {loading ? "Saving..." : "Save Changes"}
      </button>
    </form>
  );
}
