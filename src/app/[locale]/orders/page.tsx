import OrdersPage from "@/components/pages/OrdersPage";
import { checkAuth } from "@/lib/auth/server";
import { redirect } from "next/navigation";

export default async function Page({ params }: { params: { locale: string } }) {
  const isAuthenticated = await checkAuth();

  if (!isAuthenticated) {
    const next = encodeURIComponent("/orders");
    redirect(`/${params.locale}/auth/sign-in?next=${next}`);
  }

  return <OrdersPage />;
}
