import PaymentStatusPage from "@/components/pages/PaymentStatusPage";

export default async function Page({
  params,
}: {
  params: { locale: string; orderId: string };
}) {
  return <PaymentStatusPage orderId={params.orderId} />;
}
