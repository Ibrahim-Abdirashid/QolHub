// Brand name - never changes
export const BRAND_NAME = "QolHub" as const;

export const CITIES = ["Boorama"] as const;

export const BOORAMA_DISTRICTS = [
  "Jaamacadda",
  "Xaafadda Cusub",
  "Suuqa",
  "Sheikh Cali Jawhar",
  "Dheenta",
  "Sheekh Nuur",
] as const;

export const PROPERTY_TYPES: { value: string; label: string }[] = [
  { value: "full_house", label: "Full House (Villa)" },
  { value: "apartment", label: "Apartment" },
  { value: "room", label: "Single Room" },
];

export const LISTING_MODES: { value: string; label: string; desc: string }[] = [
  {
    value: "entire_available",
    label: "Entire property available for rent",
    desc: "The entire house is available",
  },
  {
    value: "rooms_available",
    label: "Occupied house, rooms available",
    desc: "The house is occupied but rooms are available",
  },
];

export const AMENITIES: { value: string; label: string }[] = [
  { value: "Electricity & Water 24/7", label: "Electricity & Water 24/7" },
  { value: "Spacious Parking", label: "Spacious Parking" },
  { value: "Security Fence", label: "Security Fence" },
  { value: "Air Conditioning (AC)", label: "Air Conditioning (AC)" },
  { value: "WiFi", label: "WiFi" },
  { value: "Private Bathroom", label: "Private Bathroom" },
];
