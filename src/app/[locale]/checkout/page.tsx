import CheckoutPage from "@/components/pages/CheckoutPage";
import { requireAuth } from "@/lib/auth/server";

export default function Page({ params }: { params: { locale: string } }) {
  requireAuth({ locale: params.locale, next: "/checkout" });
  return <CheckoutPage />;
}
