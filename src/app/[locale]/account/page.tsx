import AccountPage from "@/components/pages/AccountPage";
import { checkAuth } from "@/lib/auth/server";
import { redirect } from "next/navigation";

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const isAuthenticated = await checkAuth();

  if (!isAuthenticated) {
    const next = encodeURIComponent("/account");
    redirect(`/${locale}/auth/sign-in?next=${next}`);
  }

  return <AccountPage />;
}
