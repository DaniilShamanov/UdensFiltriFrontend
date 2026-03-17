import ProductDetailPage from "@/components/pages/ProductDetailPage";

export default async function Page({ 
  params
}: {
  params: Promise<{ id: number }>;
}) {
  const { id } = await params;

  return <ProductDetailPage productId={id} />;
}
