import AccountPage from "@/components/pages/AccountPage";
import { requireAuth } from "@/lib/auth/server";

export default function Page({ params }: { params: { locale: string } }) {
  requireAuth({ locale: params.locale, next: "/account" });
  return <AccountPage />;
}
