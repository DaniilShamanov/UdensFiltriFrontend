import ProductDetailPage from "@/components/pages/ProductDetailPage";

export default function Page({ params }: { params: { id: string } }) {
  return <ProductDetailPage productId={params.id} />;
}
