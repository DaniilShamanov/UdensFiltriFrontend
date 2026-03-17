"use client";

import React, { useState } from 'react';
import { ShoppingCart } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Product } from '@/lib/types';
import { useApp } from '@/contexts/AppContext';
import { ImageWithFallback } from '@/components/figma/ImageWithFallback';
import { toast } from 'sonner';
import { Link } from '@/navigation';
import { Input } from '@/components/ui/input';

interface ProductCardProps {
  product: Product;
  showWholesalePrice?: boolean;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, showWholesalePrice }) => {
  const { addToCart } = useApp();
  const [quantity, setQuantity] = useState(1);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product.id, quantity);
    toast.success(`Added ${quantity} item${quantity > 1 ? 's' : ''} to cart!`, {
      description: product.name,
    });
  };

  const handleQuantityChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(event.target.value, 10);
    if (Number.isNaN(value)) {
      setQuantity(1);
      return;
    }

    setQuantity(Math.max(1, value));
  };

  const displayPrice = showWholesalePrice && product.wholesalePrice 
    ? product.wholesalePrice 
    : product.price;

  // Generate Unsplash URL from product image search term
  const imageUrl = `https://source.unsplash.com/400x400/?${encodeURIComponent(product.image)}`;

  return (
    <Link href={`/products/${encodeURIComponent(product.id)}`} className="block" aria-label={product.name}>
      <Card className="cursor-pointer hover:shadow-xl transition-all duration-300 group overflow-hidden">
        <CardContent className="p-0">
        <div className="relative aspect-square bg-muted overflow-hidden">
          <ImageWithFallback
            src={imageUrl}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
          />
          {!product.inStock && (
            <Badge className="absolute top-2 right-2 bg-destructive">
              Out of Stock
            </Badge>
          )}
          {showWholesalePrice && product.wholesalePrice && (
            <Badge className="absolute top-2 left-2 bg-accent">
              Wholesale
            </Badge>
          )}
        </div>
        <div className="p-4">
          <div className="text-sm text-muted-foreground mb-1">{product.brand}</div>
          <h3 className="font-semibold mb-2 line-clamp-2 h-12 group-hover:text-primary transition-colors">
            {product.name}
          </h3>
          <div className="flex items-center justify-between">
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-bold text-primary">€{displayPrice.toFixed(2)}</span>
              {showWholesalePrice && product.wholesalePrice && product.wholesalePrice < product.price && (
                <span className="text-sm text-muted-foreground line-through">
                  €{product.price.toFixed(2)}
                </span>
              )}
            </div>
          </div>
          <div className="mt-3">
            <Input
              type="number"
              min={1}
              value={quantity}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
              onChange={handleQuantityChange}
              className="h-8"
            />
          </div>
          <Button
            className="w-full mt-3 bg-accent hover:bg-accent/90"
            size="sm"
            onClick={handleAddToCart}
            disabled={!product.inStock}
          >
            <ShoppingCart className="h-4 w-4 mr-2" />
            {product.inStock ? 'Add to Cart' : 'Out of Stock'}
          </Button>
        </div>
        </CardContent>
      </Card>
    </Link>
  );
};

export default ProductCard;
