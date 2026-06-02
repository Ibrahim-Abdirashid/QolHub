import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { getSession } from "@/lib/auth";

export async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getSession();

  return (
    <>
      <Header user={user} />
      <main className="flex-1">{children}</main>
      <Footer />
    </>
  );
}
