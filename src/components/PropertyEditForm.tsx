"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Save, AlertCircle, Trash2 } from "lucide-react";

interface PropertyEditFormProps {
  property: {
    _id: string;
    title: string;
    description: string;
    price: number;
    rooms: number;
    bathrooms: number;
    area?: number;
    availableRooms?: number;
    amenities: string[];
    status: string;
  };
}

const AMENITIES_LIST = [
  "WiFi",
  "Parking",
  "Air Conditioning",
  "Kitchen",
  "Balcony",
  "Garden",
  "Security",
  "Water Tank",
];

export function PropertyEditForm({ property }: PropertyEditFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    title: property.title,
    description: property.description,
    price: property.price,
    rooms: property.rooms,
    bathrooms: property.bathrooms,
    area: property.area || "",
    availableRooms: property.availableRooms || "",
    amenities: property.amenities,
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "area" || name === "availableRooms"
          ? value
          : name === "price" || name === "rooms" || name === "bathrooms"
            ? Number(value)
            : value,
    }));
    setError("");
  };

  const handleAmenityToggle = (amenity: string) => {
    setFormData((prev) => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter((a) => a !== amenity)
        : [...prev.amenities, amenity],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const payload = {
        ...formData,
        area: formData.area === "" ? undefined : Number(formData.area),
        availableRooms: formData.availableRooms === "" ? undefined : Number(formData.availableRooms),
      };

      const response = await fetch(`/api/properties/${property._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to update property");
        return;
      }

      setSuccess(true);
      router.refresh();
      setTimeout(() => {
        router.back();
      }, 1500);
    } catch (err) {
      setError("An error occurred while updating property");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this property?")) return;

    setDeleting(true);
    setError("");

    try {
      const response = await fetch(`/api/properties/${property._id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.error || "Failed to delete property");
        return;
      }

      setSuccess(true);
      router.refresh();
      setTimeout(() => {
        router.push("/dashboard/my-properties");
      }, 1000);
    } catch (err) {
      setError("An error occurred while deleting property");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="flex gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {success && (
        <div className="flex gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
          <span className="text-sm text-green-700">✓ Property updated successfully</span>
        </div>
      )}

      {/* Basic Information */}
      <div className="space-y-4 bg-gray-50 p-6 rounded-lg">
        <h3 className="font-semibold text-gray-900">Basic Information</h3>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Title
          </label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={4}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Pricing & Details */}
      <div className="space-y-4 bg-gray-50 p-6 rounded-lg">
        <h3 className="font-semibold text-gray-900">Pricing & Details</h3>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Monthly Price ($)
            </label>
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleChange}
              min="0"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Area (m²)
            </label>
            <input
              type="number"
              name="area"
              value={formData.area}
              onChange={handleChange}
              min="0"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Rooms
            </label>
            <input
              type="number"
              name="rooms"
              value={formData.rooms}
              onChange={handleChange}
              min="0"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Bathrooms
            </label>
            <input
              type="number"
              name="bathrooms"
              value={formData.bathrooms}
              onChange={handleChange}
              min="0"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Available Rooms
            </label>
            <input
              type="number"
              name="availableRooms"
              value={formData.availableRooms}
              onChange={handleChange}
              min="0"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Amenities */}
      <div className="space-y-4 bg-gray-50 p-6 rounded-lg">
        <h3 className="font-semibold text-gray-900">Amenities</h3>

        <div className="grid grid-cols-2 gap-3">
          {AMENITIES_LIST.map((amenity) => (
            <label key={amenity} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.amenities.includes(amenity)}
                onChange={() => handleAmenityToggle(amenity)}
                className="w-4 h-4 rounded border-gray-300"
              />
              <span className="text-sm text-gray-700">{amenity}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition font-medium"
        >
          <Save className="w-5 h-5" />
          {loading ? "Saving..." : "Save Changes"}
        </button>

        {property.status === "pending" && (
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleting}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition font-medium"
          >
            <Trash2 className="w-5 h-5" />
            {deleting ? "Deleting..." : "Delete"}
          </button>
        )}
      </div>

      {property.status !== "pending" && (
        <p className="text-xs text-gray-500">
          Note: You can only delete properties that are in pending status.
        </p>
      )}
    </form>
  );
}
