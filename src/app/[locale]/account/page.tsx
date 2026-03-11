import AccountPage from "@/components/pages/AccountPage";
import { requireAuth } from "@/lib/auth/server";

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  requireAuth({ locale, next: "/account" });
  return <AccountPage />;
}
