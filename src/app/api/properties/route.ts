import { NextResponse } from "next/server";
import { z } from "zod";
import { connectDB } from "@/lib/mongodb";
import { Property } from "@/models/Property";
import { getSession, requireRole } from "@/lib/auth";
import { serializeProperty } from "@/lib/api";

const createSchema = z.object({
  title: z.string().min(3),
  description: z.string().min(10),
  city: z.string().min(2),
  district: z.string().min(2),
  propertyType: z.enum(["full_house", "apartment", "room"]),
  listingMode: z.enum(["entire_available", "rooms_available"]),
  price: z.number().positive(),
  rooms: z.number().int().min(0),
  bathrooms: z.number().int().min(0),
  area: z.number().optional(),
  availableRooms: z.number().int().min(1).optional(),
  images: z.array(z.string()).default([]),
  amenities: z.array(z.string()).default([]),
});

export async function GET(request: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const city = searchParams.get("city");
    const type = searchParams.get("type");
    const listingMode = searchParams.get("listingMode");
    const mine = searchParams.get("mine") === "true";
    const status = searchParams.get("status");
    const limit = Math.min(Number(searchParams.get("limit") || 20), 50);

    const session = await getSession();
    const filter: Record<string, unknown> = {};

    if (mine && session && requireRole(session, ["landlord", "admin"])) {
      filter.landlord = session.id;
    } else if (status === "pending" && session && session.role === "admin") {
      filter.status = "pending";
    } else {
      filter.status = "active";
    }

    if (city) filter.city = new RegExp(city, "i");
    if (type) filter.propertyType = type;
    if (listingMode) filter.listingMode = listingMode;

    const properties = await Property.find(filter)
      .populate("landlord", "name phone avatar")
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    return NextResponse.json({
      properties: properties.map((p) =>
        serializeProperty(p as Record<string, unknown>)
      ),
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Cilad ayaa dhacday" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!requireRole(session, ["landlord", "admin"])) {
      return NextResponse.json({ error: "Lama ogola" }, { status: 401 });
    }

    if (session.role === "landlord" && session.accountStatus !== "approved") {
      return NextResponse.json(
        { error: "Akoonkaaga weli lama ansixin. Fadlan sug inta maamulku ka hubinayo." },
        { status: 403 }
      );
    }

    const body = await request.json();
    const data = createSchema.parse(body);

    if (
      data.listingMode === "rooms_available" &&
      (!data.availableRooms || data.availableRooms < 1)
    ) {
      return NextResponse.json(
        { error: "Fadlan geli tirada qolalka banaan" },
        { status: 400 }
      );
    }

    await connectDB();
    const property = await Property.create({
      ...data,
      landlord: session.id,
      status: session.role === "admin" ? "active" : "pending",
      verified: session.role === "admin",
    });

    const populated = await Property.findById(property._id)
      .populate("landlord", "name phone avatar")
      .lean();

    return NextResponse.json({
      property: serializeProperty(populated as Record<string, unknown>),
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: "Xogta ma saxna" }, { status: 400 });
    }
    console.error(err);
    return NextResponse.json({ error: "Cilad ayaa dhacday" }, { status: 500 });
  }
}
