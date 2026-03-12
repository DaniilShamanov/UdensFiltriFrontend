import PaymentPage from "@/components/pages/PaymentPage";
import { checkAuth } from "@/lib/auth/server";
import { redirect } from "next/navigation";

export default async function Page({ params }: { params: { locale: string } }) {
  const isAuthenticated = await checkAuth();

  if (!isAuthenticated) {
    const next = encodeURIComponent("/payment");
    redirect(`/${params.locale}/auth/sign-in?next=${next}`);
  }

  return <PaymentPage />;
}
