export type UserRole = "admin" | "super_admin" | "landlord" | "tenant";

export type PropertyStatus = "pending" | "active" | "rejected" | "rented";

export type ListingMode = "entire_available" | "rooms_available";

export type PropertyType = "full_house" | "apartment" | "room";

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  avatar?: string;
  accountStatus?: "pending" | "approved" | "rejected";
  emailVerified: boolean;
}

export interface PropertyDTO {
  _id: string;
  title: string;
  description: string;
  city: string;
  district: string;
  propertyType: PropertyType;
  listingMode: ListingMode;
  price: number;
  rooms: number;
  bathrooms: number;
  area?: number;
  availableRooms?: number;
  images: string[];
  amenities: string[];
  status: PropertyStatus;
  verified: boolean;
  rejectionReason?: string;
  landlord: {
    _id: string;
    name: string;
    email?: string;
    phone?: string;
    avatar?: string;
  };
  createdAt: string;
}
