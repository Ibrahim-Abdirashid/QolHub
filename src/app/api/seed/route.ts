import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/mongodb";
import { User } from "@/models/User";
import { Property } from "@/models/Property";

const DEMO_IMAGES = [
  "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80",
  "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&q=80",
  "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80",
  "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800&q=80",
];

export async function POST() {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Lama ogola" }, { status: 403 });
  }

  try {
    await connectDB();

    const count = await Property.countDocuments();
    if (count > 0) {
      return NextResponse.json({ message: "Horey ayaa la abuuray xogta demo" });
    }

    const password = await bcrypt.hash("password123", 10);

    const admin = await User.create({
      name: "Axmed Cali",
      email: "admin@qolhub.so",
      password,
      role: "admin",
      phone: "+252 63 0000000",
      emailVerified: true,
    });

    const landlord = await User.create({
      name: "Axmed Maxamed",
      email: "milkiile@qolhub.so",
      password,
      role: "landlord",
      phone: "+252 63 1111111",
      emailVerified: true,
    });

    await User.create({
      name: "Sahra Jaamac",
      email: "tenant@qolhub.so",
      password,
      role: "tenant",
      phone: "+252 63 2222222",
      emailVerified: true,
    });

    await Property.insertMany([
      {
        title: "Guri dhan oo Casri ah",
        description:
          "Guri casri ah oo ku yaal Boorama, wuxuu leeyahay 4 qol, musqulo badan, dayr amni ah, koronto iyo biyo joogto ah. Ku habboon ardayda jaamacadda iyo qoysaska.",
        city: "Boorama",
        district: "Jaamacadda",
        propertyType: "full_house",
        listingMode: "entire_available",
        price: 450,
        rooms: 4,
        bathrooms: 3,
        area: 240,
        images: DEMO_IMAGES,
        amenities: [
          "Koronto iyo Biyo joogto ah",
          "Parking ballaaran",
          "Dayr amni ah",
          "Air Conditioning (AC)",
        ],
        status: "active",
        verified: true,
        landlord: landlord._id,
      },
      {
        title: "Guri Qoys oo Waasac ah",
        description: "Guri qoys oo waasac ah oo ku yaal xaafadda cusub ee Boorama.",
        city: "Boorama",
        district: "Xaafadda Cusub",
        propertyType: "full_house",
        listingMode: "entire_available",
        price: 380,
        rooms: 3,
        bathrooms: 2,
        area: 180,
        images: [DEMO_IMAGES[1], DEMO_IMAGES[2]],
        amenities: ["Koronto iyo Biyo joogto ah", "Dayr amni ah"],
        status: "active",
        verified: true,
        landlord: landlord._id,
      },
      {
        title: "Qol Arday – Jaamacadda u dhow",
        description:
          "Guri la dagan yahay laakiin 2 qol ayaa banaan. Ku habboon ardayda jaamacadda Boorama.",
        city: "Boorama",
        district: "Jaamacadda",
        propertyType: "room",
        listingMode: "rooms_available",
        price: 80,
        rooms: 1,
        bathrooms: 1,
        availableRooms: 2,
        images: [DEMO_IMAGES[3]],
        amenities: ["Koronto iyo Biyo joogto ah", "WiFi"],
        status: "active",
        verified: true,
        landlord: landlord._id,
      },
      {
        title: "Villa Hodan",
        description: "Villa casri ah oo sugaya ansixinta maamulaha.",
        city: "Muqdisho",
        district: "Hodan",
        propertyType: "full_house",
        listingMode: "entire_available",
        price: 850,
        rooms: 5,
        bathrooms: 4,
        area: 320,
        images: [DEMO_IMAGES[0]],
        amenities: ["Parking ballaaran", "Dayr amni ah"],
        status: "pending",
        verified: false,
        landlord: landlord._id,
      },
    ]);

    return NextResponse.json({
      message: "Xogta demo waa la abuuray",
      accounts: {
        admin: "admin@qolhub.so",
        landlord: "milkiile@qolhub.so",
        tenant: "tenant@qolhub.so",
        password: "password123",
      },
      adminId: admin._id.toString(),
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Cilad ayaa dhacday" }, { status: 500 });
  }
}
