import ProductDetailPage from "@/components/pages/ProductDetailPage";

export default function Page({ params }: { params: { id: number } }) {
  return <ProductDetailPage productId={params.id} />;
}
