import type { PropertyDTO } from "@/types";

export function serializeProperty(doc: Record<string, unknown>): PropertyDTO {
  const landlord = doc.landlord as Record<string, unknown> | undefined;
  return {
    _id: String(doc._id),
    title: doc.title as string,
    description: doc.description as string,
    city: doc.city as string,
    district: doc.district as string,
    propertyType: doc.propertyType as PropertyDTO["propertyType"],
    listingMode: doc.listingMode as PropertyDTO["listingMode"],
    price: doc.price as number,
    rooms: doc.rooms as number,
    bathrooms: doc.bathrooms as number,
    area: doc.area as number | undefined,
    availableRooms: doc.availableRooms as number | undefined,
    images: (doc.images as string[]) || [],
    amenities: (doc.amenities as string[]) || [],
    status: doc.status as PropertyDTO["status"],
    verified: !!doc.verified,
    landlord: landlord
      ? {
          _id: String(landlord._id),
          name: landlord.name as string,
          email: landlord.email as string | undefined,
          phone: landlord.phone as string | undefined,
          avatar: landlord.avatar as string | undefined,
        }
      : { _id: String(doc.landlord), name: "Landlord" },
    createdAt:
      doc.createdAt instanceof Date
        ? doc.createdAt.toISOString()
        : String(doc.createdAt),
  };
}
