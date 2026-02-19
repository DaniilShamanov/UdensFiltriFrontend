"use client";

import React, { useState } from 'react';
import { Star, ShoppingCart, ChevronLeft, Minus, Plus, Check, Package, Shield, Truck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { products } from '@/lib/mockData';
import { useApp } from '@/contexts/AppContext';
import { Link, useRouter } from '@/navigation';
import { ImageWithFallback } from '@/components/figma/ImageWithFallback';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';

interface ProductDetailPageProps {
  productId: string;
}

const ProductDetailPage: React.FC<ProductDetailPageProps> = ({ productId }) => {
  const router = useRouter();
  const { user, addToCart } = useApp();
  const [quantity, setQuantity] = useState(1);
  const t = useTranslations('productDetail');

  const product = products.find(p => p.id === productId);

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-bold mb-4">{t('notFound.title')}</h2>
        <Button onClick={() => router.push('/products')}>{t('backToProducts')}</Button>
      </div>
    );
  }

  const handleAddToCart = () => {
    addToCart(product.id, quantity);
    toast.success(t('toast.added', { count: quantity, name: product.name }), {
      description: product.name,
    });
  };

  const displayPrice = user?.is_company && product.wholesalePrice 
    ? product.wholesalePrice 
    : product.price;

  const relatedProducts = products
    .filter(p => p.category === product.category && p.id !== product.id)
    .slice(0, 4);

  // Generate Unsplash URL from product image search term
  const imageUrl = `https://source.unsplash.com/800x800/?${encodeURIComponent(product.image)}`;
  const thumbnailUrl = `https://source.unsplash.com/200x200/?${encodeURIComponent(product.image)}`;

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4">
        {/* Back Button */}
        <Button
          variant="ghost"
          className="mb-6"
          onClick={() => router.push('/products')}
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          {t('backToProducts')}
        </Button>

        {/* Product Details */}
        <div className="grid lg:grid-cols-2 gap-12 mb-16">
          {/* Images */}
          <div className="space-y-4">
            <div className="aspect-square bg-muted rounded-lg overflow-hidden border-2">
              <ImageWithFallback
                src={imageUrl}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="grid grid-cols-4 gap-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="aspect-square bg-muted rounded-md overflow-hidden border cursor-pointer hover:border-primary">
                  <ImageWithFallback
                    src={thumbnailUrl}
                    alt={`${product.name} ${i}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="outline">{product.brand}</Badge>
                {product.inStock ? (
                  <Badge className="bg-green-500">{t('inStock')}</Badge>
                ) : (
                  <Badge variant="destructive">{t('outOfStock')}</Badge>
                )}
              </div>
              <h1 className="text-3xl font-bold mb-4">{product.name}</h1>
              <div className="flex items-center gap-2 mb-4">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-5 w-5 ${
                        i < Math.floor(product.rating)
                          ? 'fill-accent text-accent'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-muted-foreground">
                  {t('ratingLabel', { rating: product.rating, count: product.reviews })}
                </span>
              </div>
            </div>

            <Separator />

            {/* Price */}
            <div>
              <div className="flex items-baseline gap-3 mb-2">
                <span className="text-4xl font-bold text-primary">€{displayPrice.toFixed(2)}</span>
                {user?.is_company && product.wholesalePrice && product.wholesalePrice < product.price && (
                  <span className="text-xl text-muted-foreground line-through">
                    €{product.price.toFixed(2)}
                  </span>
                )}
              </div>
              {user?.is_company && product.wholesalePrice && (
                <Badge className="bg-accent">{t('wholesaleBadge')}</Badge>
              )}
            </div>

            <Separator />

            {/* Quantity */}
            <div>
              <label className="block font-semibold mb-3">{t('quantityLabel')}</label>
              <div className="flex items-center gap-4">
                <div className="flex items-center border rounded-lg">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="w-16 text-center font-semibold">{quantity}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setQuantity(quantity + 1)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <Button
                  size="lg"
                  className="flex-1 bg-accent hover:bg-accent/90"
                  onClick={handleAddToCart}
                  disabled={!product.inStock}
                >
                  <ShoppingCart className="h-5 w-5 mr-2" />
                  {t('addToCart')}
                </Button>
              </div>
            </div>

            {/* Features */}
            <Card className="bg-muted/30 border-none">
              <CardContent className="p-6 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="bg-primary/10 p-2 rounded-lg">
                    <Truck className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <div className="font-semibold">{t('features.freeShipping.title')}</div>
                    <div className="text-sm text-muted-foreground">{t('features.freeShipping.description')}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="bg-primary/10 p-2 rounded-lg">
                    <Shield className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <div className="font-semibold">{t('features.warranty.title')}</div>
                    <div className="text-sm text-muted-foreground">{t('features.warranty.description')}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="bg-primary/10 p-2 rounded-lg">
                    <Package className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <div className="font-semibold">{t('features.returns.title')}</div>
                    <div className="text-sm text-muted-foreground">{t('features.returns.description')}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Product Details Tabs */}
        <Tabs defaultValue="description" className="mb-16">
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="description">{t('tabs.description')}</TabsTrigger>
            <TabsTrigger value="specifications">{t('tabs.specifications')}</TabsTrigger>
            <TabsTrigger value="reviews">{t('tabs.reviews')}</TabsTrigger>
          </TabsList>
          <TabsContent value="description" className="mt-6">
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold text-lg mb-4">{t('description.title')}</h3>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  {product.description}
                </p>
                <h4 className="font-semibold mb-3">{t('description.featuresTitle')}</h4>
                <ul className="space-y-2">
                  {t.raw('description.features').map((feature: string, idx: number) => (
                    <li key={idx} className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="specifications" className="mt-6">
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold text-lg mb-4">{t('specifications.title')}</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-muted-foreground">{t('specifications.brand')}</span>
                    <span className="font-medium">{product.brand}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-muted-foreground">{t('specifications.model')}</span>
                    <span className="font-medium">{product.id}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-muted-foreground">{t('specifications.category')}</span>
                    <span className="font-medium capitalize">{product.category.replace('-', ' ')}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-muted-foreground">{t('specifications.warranty')}</span>
                    <span className="font-medium">{t('specifications.warrantyValue')}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="reviews" className="mt-6">
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold text-lg mb-4">{t('reviews.title')}</h3>
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="border-b pb-4">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="flex">
                          {[...Array(5)].map((_, j) => (
                            <Star key={j} className="h-4 w-4 fill-accent text-accent" />
                          ))}
                        </div>
                        <span className="font-semibold">{t('reviews.sampleTitle')}</span>
                      </div>
                      <p className="text-sm text-muted-foreground mb-1">
                        {t('reviews.sampleText')}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {t('reviews.customerLabel', { number: i })}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold mb-6">{t('relatedTitle')}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((p) => {
                const relatedImageUrl = `https://source.unsplash.com/300x300/?${encodeURIComponent(p.image)}`;
                return (
                  <Card
                    key={p.id}
                    className="cursor-pointer hover:shadow-lg transition-shadow"
                    onClick={() => router.push(`/products/${encodeURIComponent(p.id)}`)}
                  >
                    <CardContent className="p-4">
                      <div className="aspect-square bg-muted rounded-lg mb-3 overflow-hidden">
                        <ImageWithFallback
                          src={relatedImageUrl}
                          alt={p.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <h3 className="font-semibold mb-2 line-clamp-2">{p.name}</h3>
                      <div className="text-lg font-bold text-primary">€{p.price.toFixed(2)}</div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetailPage;