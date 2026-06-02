"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Upload, X, Check, Phone } from "lucide-react";
import { Button } from "@/components/ui/Button";
import {
  CITIES,
  BOORAMA_DISTRICTS,
  PROPERTY_TYPES,
  LISTING_MODES,
  AMENITIES,
} from "@/lib/constants";

export function AddPropertyForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [listingMode, setListingMode] = useState("entire_available");
  
  // File upload state
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Contact Info Modal State
  const [showContactModal, setShowContactModal] = useState(false);
  const [userPhone, setUserPhone] = useState("");
  const [pendingFormData, setPendingFormData] = useState<FormData | null>(null);
  const [phoneFetched, setPhoneFetched] = useState(false);

  useEffect(() => {
    fetch("/api/users/me/profile")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data.phone) {
          setUserPhone(data.data.phone);
        }
        setPhoneFetched(true);
      })
      .catch((err) => console.error(err));
  }, []);

  // Compress image before upload
  const compressImage = (file: File): Promise<File> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = document.createElement("img");
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement("canvas");
          
          // Max dimension 1200px
          const MAX_WIDTH = 1200;
          const MAX_HEIGHT = 1200;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          ctx?.drawImage(img, 0, 0, width, height);

          canvas.toBlob(
            (blob) => {
              if (blob) {
                const compressedFile = new File([blob], file.name, {
                  type: "image/jpeg",
                  lastModified: Date.now(),
                });
                resolve(compressedFile);
              } else {
                reject(new Error("Compression failed"));
              }
            },
            "image/jpeg",
            0.8 // 80% quality
          );
        };
      };
      reader.onerror = (error) => reject(error);
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      if (selectedImages.length + newFiles.length > 10) {
        setError("You can only upload up to 10 images.");
        return;
      }
      
      const newPreviews = newFiles.map(file => URL.createObjectURL(file));
      setSelectedImages(prev => [...prev, ...newFiles]);
      setPreviewUrls(prev => [...prev, ...newPreviews]);
      setError("");
    }
  };

  const removeImage = (index: number) => {
    const newImages = [...selectedImages];
    const newPreviews = [...previewUrls];
    
    // Revoke object URL to avoid memory leaks
    URL.revokeObjectURL(newPreviews[index]);
    
    newImages.splice(index, 1);
    newPreviews.splice(index, 1);
    
    setSelectedImages(newImages);
    setPreviewUrls(newPreviews);
  };

  const uploadImagesToServer = async (files: File[]) => {
    const formData = new FormData();
    
    for (const file of files) {
      const compressed = await compressImage(file);
      formData.append("images", compressed);
    }

    const res = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || "Failed to upload images");
    }

    const data = await res.json();
    return data.urls as string[];
  };

  function handleInitialSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    
    if (selectedImages.length === 0) {
      setError("Please select at least one image.");
      return;
    }

    const form = new FormData(e.currentTarget);
    setPendingFormData(form);
    setShowContactModal(true);
  }

  async function handleFinalSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!pendingFormData) return;
    
    setShowContactModal(false);
    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      if (userPhone) {
        await fetch("/api/users/me/profile", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ phone: userPhone }),
        });
      }

      const form = pendingFormData;
      
      // Upload images first
      let uploadedImageUrls: string[] = [];
      if (selectedImages.length > 0) {
        uploadedImageUrls = await uploadImagesToServer(selectedImages);
      } else {
        throw new Error("Must select at least one image");
      }

      const selectedAmenities = AMENITIES.filter(
        (_, i) => form.get(`amenity-${i}`) === "on"
      ).map(a => a.value);

      const body = {
        title: form.get("title"),
        description: form.get("description"),
        city: form.get("city"),
        district: form.get("district"),
        propertyType: form.get("propertyType"),
        listingMode,
        price: Number(form.get("price")),
        rooms: Number(form.get("rooms")),
        bathrooms: Number(form.get("bathrooms")),
        area: form.get("area") ? Number(form.get("area")) : undefined,
        availableRooms:
          listingMode === "rooms_available"
            ? Number(form.get("availableRooms"))
            : undefined,
        images: uploadedImageUrls,
        amenities: selectedAmenities,
      };

      const res = await fetch("/api/properties", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "An error occurred");
      }

      setSuccess(true);
      router.refresh();
      const formEl = document.getElementById("new-property-form") as HTMLFormElement;
      if (formEl) formEl.reset();
      
      // Clean up object URLs
      previewUrls.forEach(url => URL.revokeObjectURL(url));
      setSelectedImages([]);
      setPreviewUrls([]);
      setPendingFormData(null);
      
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="rounded-2xl border border-green-200 bg-green-50 p-8 text-center shadow-sm">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-green-600 mb-4">
          <Check className="h-8 w-8" />
        </div>
        <h2 className="text-xl font-bold text-green-800 mb-2">Success!</h2>
        <p className="text-green-700">Property added successfully and is waiting for approval.</p>
        <Button onClick={() => setSuccess(false)} className="mt-6">
          Add Another Property
        </Button>
      </div>
    );
  }

  return (
    <>
      <form
        id="new-property-form"
        onSubmit={handleInitialSubmit}
        className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm relative"
      >
      <h2 className="text-lg font-bold text-slate-900">Add Property</h2>

      {error && (
        <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      <div className="mt-5 space-y-4">
        <label className="block">
          <span className="text-sm font-medium text-slate-700">
            Property Title
          </span>
          <input
            name="title"
            required
            placeholder="E.g., Beautiful Family House"
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-[#0c3d6e]"
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium text-slate-700">
            Property Type
          </span>
          <select
            name="propertyType"
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-[#0c3d6e]"
          >
            {PROPERTY_TYPES.map((tItem) => (
              <option key={tItem.value} value={tItem.value}>
                {tItem.label}
              </option>
            ))}
          </select>
        </label>

        <fieldset>
          <legend className="text-sm font-medium text-slate-700">
            Listing Status
          </legend>
          <div className="mt-2 space-y-2">
            {LISTING_MODES.map((mode) => (
              <label
                key={mode.value}
                className={`flex cursor-pointer flex-col rounded-lg border p-3 transition ${
                  listingMode === mode.value
                    ? "border-[#0c3d6e] bg-accent"
                    : "border-slate-200"
                }`}
              >
                <span className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="listingMode"
                    value={mode.value}
                    checked={listingMode === mode.value}
                    onChange={() => setListingMode(mode.value)}
                  />
                  <span className="text-sm font-medium">{mode.label}</span>
                </span>
                <span className="ml-6 text-xs text-slate-500">
                  {mode.desc}
                </span>
              </label>
            ))}
          </div>
        </fieldset>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="text-sm font-medium text-slate-700">
              Price / month ($)
            </span>
            <input
              name="price"
              type="number"
              required
              min={1}
              placeholder="500"
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-[#0c3d6e]"
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-slate-700">Rooms</span>
            <input
              name="rooms"
              type="number"
              required
              min={0}
              placeholder="4"
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-[#0c3d6e]"
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-slate-700">Bathrooms</span>
            <input
              name="bathrooms"
              type="number"
              required
              min={0}
              placeholder="2"
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-[#0c3d6e]"
            />
          </label>
          {listingMode === "rooms_available" && (
            <label className="block">
              <span className="text-sm font-medium text-slate-700">
                Available Rooms
              </span>
              <input
                name="availableRooms"
                type="number"
                required
                min={1}
                placeholder="2"
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-[#0c3d6e]"
              />
            </label>
          )}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="text-sm font-medium text-slate-700">City</span>
            <select
              name="city"
              required
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm"
              defaultValue={CITIES[0]}
            >
              {CITIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="text-sm font-medium text-slate-700">District</span>
            <select
              name="district"
              required
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm"
            >
              <option value="">Select District</option>
              {BOORAMA_DISTRICTS.map(d => (
                 <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </label>
        </div>

        <label className="block">
          <span className="text-sm font-medium text-slate-700">Description</span>
          <textarea
            name="description"
            required
            rows={4}
            placeholder="Property description..."
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm"
          />
        </label>

        <div>
           <span className="block text-sm font-medium text-slate-700 mb-1">
            Images
          </span>
          
          <input
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            ref={fileInputRef}
            onChange={handleFileChange}
          />
          
          {previewUrls.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-2">
               {previewUrls.map((url, i) => (
                 <div key={i} className="relative aspect-video rounded-lg overflow-hidden border border-slate-200">
                    <Image src={url} alt="Preview" fill className="object-cover" />
                    <button 
                      type="button" 
                      onClick={() => removeImage(i)}
                      className="absolute top-1 right-1 p-1 bg-white/80 hover:bg-red-50 text-red-600 rounded-full"
                    >
                      <X className="w-4 h-4" />
                    </button>
                 </div>
               ))}
            </div>
          )}

          {selectedImages.length < 10 && (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="mt-2 w-full flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 py-8 text-center hover:bg-slate-100 transition"
            >
              <Upload className="h-8 w-8 text-slate-400" />
              <p className="mt-2 text-sm text-slate-600">
                Upload Images (Max 10)
              </p>
              <p className="text-xs text-slate-400">Allowed formats: JPG, PNG, WEBP</p>
            </button>
          )}
        </div>

        <div>
          <p className="text-sm font-medium text-slate-700">Amenities</p>
          <div className="mt-2 grid gap-2 sm:grid-cols-2">
            {AMENITIES.map((a, i) => (
              <label key={a.value} className="flex items-center gap-2 text-sm">
                <input type="checkbox" name={`amenity-${i}`} />
                {a.label}
              </label>
            ))}
          </div>
        </div>
      </div>

      <Button type="submit" fullWidth className="mt-6" disabled={loading || !phoneFetched}>
        {loading ? "Saving..." : "Save Property"}
      </Button>
    </form>

    {showContactModal && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
        <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
          <div className="p-6">
            <div className="flex items-center justify-center w-12 h-12 bg-sky-100 rounded-full mb-4 mx-auto">
              <Phone className="h-6 w-6 text-[#0c3d6e]" />
            </div>
            <h3 className="text-xl font-bold text-center text-slate-900 mb-2">
              Contact Information
            </h3>
            <p className="text-sm text-center text-slate-600 mb-6">
              Please enter your valid phone number so tenants can contact you.
            </p>
            <form onSubmit={handleFinalSubmit} className="space-y-4">
              <label className="block">
                <span className="text-sm font-medium text-slate-700 block mb-1">
                  Phone Number <span className="text-red-500">*</span>
                </span>
                <input
                  type="tel"
                  required
                  value={userPhone}
                  onChange={(e) => setUserPhone(e.target.value)}
                  placeholder="061XXXXXXX"
                  className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-[#0c3d6e] focus:ring-1 focus:ring-[#0c3d6e] transition"
                />
              </label>
              <div className="pt-2 flex gap-3">
                <Button type="button" variant="outline" className="flex-1" onClick={() => setShowContactModal(false)} disabled={loading}>
                  Cancel
                </Button>
                <Button type="submit" className="flex-1 bg-[#0c3d6e] hover:bg-[#0a2e53]" disabled={loading || !userPhone.trim()}>
                  {loading ? "Sending..." : "Confirm & Submit"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    )}
    </>
  );
}
