import { PublicLayout } from "@/components/layout/PublicLayout";

export default function HelpPage() {
  return (
    <PublicLayout>
      <div className="mx-auto max-w-3xl px-4 py-16 lg:px-8">
        <h1 className="text-3xl font-bold">Help & Support</h1>
        <p className="mt-4 text-slate-600">
          Need help? Contact us:
        </p>
        <ul className="mt-6 space-y-3 text-slate-700">
          <li>
            <strong>Email:</strong> support@qolhub.so
          </li>
          <li>
            <strong>Phone:</strong> +252 63 000 0000
          </li>
          <li>
            <strong>Location:</strong> Boorama, Somaliland
          </li>
        </ul>
        <div className="mt-8 rounded-2xl bg-accent p-6">
          <h2 className="font-semibold text-[#0c3d6e]">University Students</h2>
          <p className="mt-2 text-sm text-slate-600">
            If you're a student looking for a room or house near the
            university, use the district filter for Boorama.
          </p>
        </div>
      </div>
    </PublicLayout>
  );
}
