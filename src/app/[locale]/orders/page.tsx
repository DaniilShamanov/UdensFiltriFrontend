import OrdersPage from "@/components/pages/OrdersPage";
import { requireAuth } from "@/lib/auth/server";

export default function Page({ params }: { params: { locale: string } }) {
  requireAuth({ locale: params.locale, next: "/orders" });
  return <OrdersPage />;
}
