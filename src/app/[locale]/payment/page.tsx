import PaymentPage from "@/components/pages/PaymentPage";
import { requireAuth } from "@/lib/auth/server";

export default function Page({ params }: { params: { locale: string } }) {
  requireAuth({ locale: params.locale, next: "/payment" });
  return <PaymentPage />;
}
