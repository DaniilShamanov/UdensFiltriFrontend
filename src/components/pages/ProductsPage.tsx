"use client";

import React, { useState, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { Link } from '@/navigation';
import { Search, SlidersHorizontal, Info } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { products, categories } from '@/lib/mockData';
import { Product } from '@/lib/types';
import { useApp } from '@/contexts/AppContext';
import ProductCard from '../ProductCard';

const ProductsPage: React.FC = () => {
  const searchParams = useSearchParams();
  const categoryId = searchParams.get('categoryId') || undefined;
  const subCategoryId = searchParams.get('subCategoryId') || undefined;
  const { user } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('featured');
  const [priceRange, setPriceRange] = useState([0, 1500]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [minRating, setMinRating] = useState('0');

  // Get unique brands
  const brands = useMemo(() => {
    return Array.from(new Set(products.map(p => p.brand))).sort();
  }, []);

  // Filter products
  const filteredProducts = useMemo(() => {
    let result = [...products];

    // Category filter
    if (categoryId) {
      result = result.filter(p => p.category === categoryId);
    }

    // SubCategory filter
    if (subCategoryId) {
      result = result.filter(p => p.subCategory === subCategoryId);
    }

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        p =>
          p.name.toLowerCase().includes(query) ||
          p.description.toLowerCase().includes(query) ||
          p.brand.toLowerCase().includes(query)
      );
    }

    // Price filter
    result = result.filter(p => p.price >= priceRange[0] && p.price <= priceRange[1]);

    // Brand filter
    if (selectedBrands.length > 0) {
      result = result.filter(p => selectedBrands.includes(p.brand));
    }

    // Stock filter
    if (inStockOnly) {
      result = result.filter(p => p.inStock);
    }

    // Rating filter
    if (minRating !== '0') {
      result = result.filter(p => p.rating >= parseFloat(minRating));
    }

    // Sort
    switch (sortBy) {
      case 'price-low':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        result.sort((a, b) => b.rating - a.rating);
        break;
      case 'name':
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      default:
        // Featured - keep original order
        break;
    }

    return result;
  }, [searchQuery, sortBy, priceRange, selectedBrands, inStockOnly, minRating, categoryId, subCategoryId]);

  const toggleBrand = (brand: string) => {
    setSelectedBrands(prev =>
      prev.includes(brand) ? prev.filter(b => b !== brand) : [...prev, brand]
    );
  };

  const currentCategory = categories.find(c => c.id === categoryId);
  const currentSubCategory = currentCategory?.subCategories.find(s => s.id === subCategoryId);

  const FilterSection = () => (
    <div className="space-y-6">
      {/* Price Range */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Label className="font-semibold">Price Range</Label>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Info className="h-4 w-4 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent>
                <p>Filter products by price range</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <Slider
          defaultValue={[0, 1500]}
          value={priceRange}
          onValueChange={setPriceRange}
          min={0}
          max={1500}
          step={10}
          className="mb-2"
        />
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>€{priceRange[0]}</span>
          <span>€{priceRange[1]}</span>
        </div>
      </div>

      {/* Brands */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Label className="font-semibold">Brands</Label>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Info className="h-4 w-4 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent>
                <p>Select one or more brands</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <div className="space-y-2">
          {brands.map(brand => (
            <div key={brand} className="flex items-center gap-2">
              <Checkbox
                id={`brand-${brand}`}
                checked={selectedBrands.includes(brand)}
                onCheckedChange={() => toggleBrand(brand)}
              />
              <Label htmlFor={`brand-${brand}`} className="cursor-pointer font-normal">
                {brand}
              </Label>
            </div>
          ))}
        </div>
      </div>

      {/* Rating */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Label className="font-semibold">Minimum Rating</Label>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Info className="h-4 w-4 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent>
                <p>Show products with at least this rating</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <RadioGroup value={minRating} onValueChange={setMinRating}>
          <div className="flex items-center gap-2">
            <RadioGroupItem value="0" id="rating-all" />
            <Label htmlFor="rating-all" className="cursor-pointer font-normal">All Ratings</Label>
          </div>
          <div className="flex items-center gap-2">
            <RadioGroupItem value="4" id="rating-4" />
            <Label htmlFor="rating-4" className="cursor-pointer font-normal">4+ Stars</Label>
          </div>
          <div className="flex items-center gap-2">
            <RadioGroupItem value="4.5" id="rating-45" />
            <Label htmlFor="rating-45" className="cursor-pointer font-normal">4.5+ Stars</Label>
          </div>
        </RadioGroup>
      </div>

      {/* Availability */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Label className="font-semibold">Availability</Label>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Info className="h-4 w-4 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent>
                <p>Show only products in stock</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <div className="flex items-center gap-2">
          <Checkbox
            id="in-stock"
            checked={inStockOnly}
            onCheckedChange={(checked) => setInStockOnly(checked as boolean)}
          />
          <Label htmlFor="in-stock" className="cursor-pointer font-normal">
            In Stock Only
          </Label>
        </div>
      </div>

      {/* Reset Filters */}
      <Button
        variant="outline"
        className="w-full"
        onClick={() => {
          setPriceRange([0, 1500]);
          setSelectedBrands([]);
          setInStockOnly(false);
          setMinRating('0');
        }}
      >
        Reset Filters
      </Button>
    </div>
  );

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4">
        {/* Breadcrumb */}
        <div className="mb-6 text-sm text-muted-foreground">
          <Link href="/" className="hover:text-primary">
            Home
          </Link>
          {' / '}
          <Link href="/products" className="hover:text-primary">
            Products
          </Link>
          {currentCategory && (
            <>
              {' / '}
              <span className="text-foreground">{currentCategory.name}</span>
            </>
          )}
          {currentSubCategory && (
            <>
              {' / '}
              <span className="text-foreground">{currentSubCategory.name}</span>
            </>
          )}
        </div>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-4">
            {currentSubCategory
              ? currentSubCategory.name
              : currentCategory
              ? currentCategory.name
              : 'All Products'}
          </h1>
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            <div className="relative flex-1 w-full md:max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search products..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2 w-full md:w-auto">
              {/* Mobile Filter Button */}
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" className="md:hidden flex-1">
                    <SlidersHorizontal className="h-4 w-4 mr-2" />
                    Filters
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-[300px]">
                  <SheetHeader>
                    <SheetTitle>Filters</SheetTitle>
                  </SheetHeader>
                  <ScrollArea className="h-[calc(100vh-8rem)] mt-6 pr-4">
                    <FilterSection />
                  </ScrollArea>
                </SheetContent>
              </Sheet>

              {/* Sort */}
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-full md:w-[200px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="featured">Featured</SelectItem>
                  <SelectItem value="price-low">Price: Low to High</SelectItem>
                  <SelectItem value="price-high">Price: High to Low</SelectItem>
                  <SelectItem value="rating">Highest Rated</SelectItem>
                  <SelectItem value="name">Name: A to Z</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-[280px_1fr] gap-8">
          {/* Desktop Filters Sidebar */}
          <aside className="hidden lg:block">
            <Card className="sticky top-24">
              <CardContent className="p-6">
                <h2 className="font-semibold text-lg mb-4">Filters</h2>
                <ScrollArea className="h-[calc(100vh-16rem)] pr-4">
                  <FilterSection />
                </ScrollArea>
              </CardContent>
            </Card>
          </aside>

          {/* Products Grid */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <p className="text-muted-foreground">
                Showing {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''}
              </p>
            </div>

            {filteredProducts.length === 0 ? (
              <Card className="p-12 text-center">
                <p className="text-muted-foreground mb-4">No products found matching your criteria.</p>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchQuery('');
                    setPriceRange([0, 1500]);
                    setSelectedBrands([]);
                    setInStockOnly(false);
                    setMinRating('0');
                  }}
                >
                  Clear All Filters
                </Button>
              </Card>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredProducts.map(product => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    showWholesalePrice={user?.isWholesale}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductsPage;