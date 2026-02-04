import PaymentStatusPage from "@/components/pages/PaymentStatusPage";
import { requireAuth } from "@/lib/auth/server";

export default function Page({
  params,
}: {
  params: { locale: string; orderId: string };
}) {
  requireAuth({
    locale: params.locale,
    next: `/payment/status/${params.orderId}`,
  });
  return <PaymentStatusPage orderId={params.orderId} />;
}
