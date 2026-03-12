import PaymentStatusPage from "@/components/pages/PaymentStatusPage";
import { checkAuth } from "@/lib/auth/server";
import { redirect } from "next/navigation";

export default async function Page({
  params,
}: {
  params: { locale: string; orderId: string };
}) {
  const isAuthenticated = await checkAuth();

  if (!isAuthenticated) {
    const next = encodeURIComponent(`/payment/status/${params.orderId}`);
    redirect(`/${params.locale}/auth/sign-in?next=${next}`);
  }

  return <PaymentStatusPage orderId={params.orderId} />;
}
