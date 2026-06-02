import { NextResponse } from "next/server";
import { z } from "zod";
import { connectDB } from "@/lib/mongodb";
import { Message } from "@/models/Message";
import { Property } from "@/models/Property";
import { getSession } from "@/lib/auth";

const schema = z.object({
  propertyId: z.string(),
  receiverId: z.string().optional(),
  content: z.string().min(5).max(2000),
});

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Lama ogola" }, { status: 401 });
    }

    await connectDB();
    const messages = await Message.find({
      $or: [{ sender: session.id }, { receiver: session.id }],
    })
      .populate("property", "title city district")
      .populate("sender", "name avatar role")
      .populate("receiver", "name avatar role")
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    return NextResponse.json({ messages });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Cilad ayaa dhacday" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { error: "Is-diiwaan geli si aad ula xidhiidho" },
        { status: 401 }
      );
    }

    const body = schema.parse(await request.json());
    await connectDB();

    const property = await Property.findById(body.propertyId);
    if (!property) {
      return NextResponse.json({ error: "Guriga lama helin" }, { status: 404 });
    }

    const isAdmin = session.role === "admin" || session.role === "super_admin";
    const isLandlord = property.landlord.toString() === session.id;

    if (property.status !== "active" && !isAdmin && !isLandlord) {
      return NextResponse.json({ error: "Guriga lama helin ama wali lama ansixin" }, { status: 404 });
    }

    const landlordId = property.landlord.toString();
    
    // Determine the receiver
    let finalReceiverId = landlordId;
    
    if (session.id === landlordId) {
       // Landlord is replying
       if (!body.receiverId) {
          return NextResponse.json({ error: "Fadlan cadee cida aad fariinta u direyso" }, { status: 400 });
       }
       finalReceiverId = body.receiverId;
    } else {
       // Tenant is sending
       if (body.receiverId && body.receiverId !== landlordId) {
           return NextResponse.json({ error: "Waxaad fariin u diri kartaa kaliya milkiilaha" }, { status: 400 });
       }
    }

    const message = await Message.create({
      property: property._id,
      sender: session.id,
      receiver: finalReceiverId,
      content: body.content,
    });

    return NextResponse.json({ message: { id: message._id.toString() } });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: "Fariinta waa gaaban tahay" }, { status: 400 });
    }
    console.error(err);
    return NextResponse.json({ error: "Cilad ayaa dhacday" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Lama ogola" }, { status: 401 });
    }

    const { senderId, propertyId } = await request.json();
    if (!senderId || !propertyId) {
      return NextResponse.json({ error: "Xogta ma dhameystirna" }, { status: 400 });
    }

    await connectDB();
    await Message.updateMany(
      {
        sender: senderId,
        receiver: session.id,
        property: propertyId,
        read: false,
      },
      { $set: { read: true } }
    );

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Cilad ayaa dhacday" }, { status: 500 });
  }
}
