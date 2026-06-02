import { connectDB } from "@/lib/mongodb";
import { Property } from "@/models/Property";
import { getSession } from "@/lib/auth";
import { PropertyEditForm } from "@/components/PropertyEditForm";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { serializeProperty } from "@/lib/api";

interface EditPageProps {
  params: Promise<{ id: string }>;
}

export default async function PropertyEditPage({ params }: EditPageProps) {
  const { id } = await params;
  const session = await getSession();

  if (!session?.id) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 mb-4">Please sign in to edit properties</p>
        <Link
          href="/auth/login"
          className="text-blue-600 hover:underline font-medium"
        >
          Sign In
        </Link>
      </div>
    );
  }

  await connectDB();

  const property = await Property.findById(id).lean();

  if (!property) {
    return <div className="text-center py-12">Property not found</div>;
  }

  // Check ownership
  if (property.landlord.toString() !== session.id) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">You don't have permission to edit this property</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/dashboard/my-properties"
          className="text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Edit Property</h1>
          <p className="text-gray-600 mt-1">{property.title}</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-8 max-w-2xl">
        <PropertyEditForm property={serializeProperty(property as any)} />
      </div>
    </div>
  );
}
