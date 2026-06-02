import type { IProperty } from "@/models/Property";

export function formatPrice(price: number) {
  return `$${price.toLocaleString()}`;
}

export function formatDate(date: Date | string) {
  return new Date(date).toLocaleDateString("so-SO", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function listingModeLabel(mode: IProperty["listingMode"]) {
  if (mode === "entire_available") return "Guri banaan"; // Note: this will need translation later if used
  return "Qolal banaan"; // Note: this will need translation later if used
}

export function availabilityLabel(property: {
  listingMode: IProperty["listingMode"];
  availableRooms?: number;
}) {
  if (property.listingMode === "entire_available") return "Waa banaan yahay"; // Note: this will need translation later if used
  const rooms = property.availableRooms ?? 0;
  return `${rooms} qol${rooms !== 1 ? "al" : ""} banaan`; // Note: this will need translation later if used
}
