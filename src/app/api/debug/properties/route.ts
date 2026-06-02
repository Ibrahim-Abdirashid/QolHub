import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Property } from "@/models/Property";

export async function GET() {
  try {
    await connectDB();
    
    // Get all properties with counts by status
    const allProperties = await Property.find().lean();
    const activeProperties = await Property.find({ status: "active" }).lean();
    const booramaProperties = await Property.find({ city: "Boorama" }).lean();
    const boomoraAndActive = await Property.find({ city: "Boorama", status: "active" }).lean();

    return NextResponse.json({
      total: allProperties.length,
      byStatus: {
        active: activeProperties.length,
        pending: (await Property.countDocuments({ status: "pending" })),
        rented: (await Property.countDocuments({ status: "rented" })),
      },
      byCity: {
        boorama: booramaProperties.length,
        total: allProperties.length,
      },
      booramaAndActive: boomoraAndActive.length,
      sample: allProperties.slice(0, 2).map(p => ({
        title: p.title,
        city: p.city,
        status: p.status,
        createdAt: p.createdAt,
      })),
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
