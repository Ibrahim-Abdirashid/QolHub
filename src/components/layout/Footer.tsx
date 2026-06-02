import Link from "next/link";

export async function Footer() {
  return (
    <footer className="mt-auto border-t border-slate-200 bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 py-12 lg:px-8">
        <div className="grid gap-10 md:grid-cols-4">
          <div className="md:col-span-2">
            <p className="text-2xl font-bold text-[#0c3d6e]">QolHub</p>
            <p className="mt-3 max-w-md text-sm text-slate-600">
              Making it easy to find a comfortable home. The house rental platform for Boorama, Somaliland.
            </p>
          </div>
          <div>
            <p className="font-semibold text-slate-800">Company</p>
            <ul className="mt-3 space-y-2 text-sm text-slate-600">
              <li>
                <Link href="/about" className="hover:text-[#0c3d6e]">About</Link>
              </li>
              <li>
                <Link href="/properties" className="hover:text-[#0c3d6e]">Properties</Link>
              </li>
              <li>
                <Link href="/help" className="hover:text-[#0c3d6e]">Help</Link>
              </li>
            </ul>
          </div>
          <div>
            <p className="font-semibold text-slate-800">Legal</p>
            <ul className="mt-3 space-y-2 text-sm text-slate-600">
              <li>
                <Link href="#" className="hover:text-[#0c3d6e]">Terms</Link>
              </li>
              <li>
                <Link href="#" className="hover:text-[#0c3d6e]">Privacy</Link>
              </li>
              <li>
                <Link href="/help" className="hover:text-[#0c3d6e]">Contact</Link>
              </li>
            </ul>
          </div>
        </div>
        <p className="mt-10 border-t border-slate-200 pt-6 text-center text-sm text-slate-500 md:text-right">
          © 2024 QolHub. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
