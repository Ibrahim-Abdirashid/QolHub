import { PublicLayout } from "@/components/layout/PublicLayout";

export default function AboutPage() {
  return (
    <PublicLayout>
      <div className="mx-auto max-w-3xl px-4 py-16 lg:px-8">
        <h1 className="text-3xl font-bold">About QolHub</h1>
        <div className="mt-6 space-y-4 leading-relaxed text-slate-600">
          <p>
            <strong>QolHub</strong> is a web platform that connects property
            owners with people looking for a house or room for rent in
            Somaliland — specifically in the city of <strong>Boorama</strong>.
          </p>
          <p>
            This project was built to solve a real problem: university
            students and visitors (such as Djibouti residents during the hot
            season) often find it very difficult to locate rental houses.
          </p>
          <p>
            Landlords can list a full vacant house or an occupied house with
            available rooms. Tenants can search, view details, and then register
            to contact the landlord.
          </p>
          <p className="text-sm text-slate-500">
            Payment systems are not yet available — they will be added in the
            future.
          </p>
        </div>
      </div>
    </PublicLayout>
  );
}
