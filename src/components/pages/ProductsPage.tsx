"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Link } from '@/navigation';
import { Search, SlidersHorizontal, ChevronLeft, ChevronRight } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import RangeSlider from '@/components/ui/slider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger
} from '@/components/ui/select';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { products, categories } from '@/lib/mockData';
import { useApp } from '@/contexts/AppContext';
import ProductCard from '../ProductCard';
import { useTranslations } from 'next-intl';

const ProductsPage: React.FC = () => {
  const searchParams = useSearchParams();
  const categoryId = searchParams.get('categoryId') || undefined;
  const subCategoryId = searchParams.get('subCategoryId') || undefined;
  const { user } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('featured');
  const [range, setRange] = React.useState({ min: 0, max: 1500 });
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [minRating, setMinRating] = useState('0');
  const [isMobile, setIsMobile] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const t = useTranslations('products');

  const formatCurrency = (value: number) => `€${value}`;

  useEffect(() => {
    const media = window.matchMedia('(max-width: 1023px)');
    const update = () => setIsMobile(media.matches);
    update();
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);

  useEffect(() => {
    const media = window.matchMedia('(max-width: 1023px)');
    const update = () => setIsMobile(media.matches);
    update();
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);

  const resetFilters = () => {
    setRange({ min: 0, max: 1500 });
    setSelectedBrands([]);
    setInStockOnly(false);
    setMinRating('0');
    setSearchQuery('');
  };

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
    result = result.filter(p => p.price >= range.min && p.price <= range.max);

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
  }, [searchQuery, sortBy, range, selectedBrands, inStockOnly, minRating, categoryId, subCategoryId]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, sortBy, range, selectedBrands, inStockOnly, minRating, categoryId, subCategoryId]);

  const pageSize = isMobile ? 10 : 20;
  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / pageSize));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedProducts = useMemo(() => {
    const start = (safePage - 1) * pageSize;
    return filteredProducts.slice(start, start + pageSize);
  }, [filteredProducts, safePage, pageSize]);

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
      <div className="space-y-2 scrollbar-hide">
        <Label className="font-semibold">{t('filters.priceRange')}</Label>
        <RangeSlider
          min={0}
          max={1500}
          step={1}
          value={range}
          onChange={(vals) => setRange({ min: vals.min, max: vals.max })}
          className="w-full"
          formatValue={formatCurrency}
          label={t('filters.priceRange')}
        />
      </div>

      {/* Brands */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Label className="font-semibold">{t('filters.brands')}</Label>
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
          <Label className="font-semibold">{t('filters.minRating')}</Label>
        </div>
        <RadioGroup value={minRating} onValueChange={setMinRating}>
          <div className="flex items-center gap-2">
            <RadioGroupItem value="0" id="rating-all" />
            <Label htmlFor="rating-all" className="cursor-pointer font-normal">{t('ratings.all')}</Label>
          </div>
          <div className="flex items-center gap-2">
            <RadioGroupItem value="4" id="rating-4" />
            <Label htmlFor="rating-4" className="cursor-pointer font-normal">{t('ratings.4plus')}</Label>
          </div>
          <div className="flex items-center gap-2">
            <RadioGroupItem value="4.5" id="rating-45" />
            <Label htmlFor="rating-45" className="cursor-pointer font-normal">{t('ratings.45plus')}</Label>
          </div>
        </RadioGroup>
      </div>

      {/* Availability */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Label className="font-semibold">{t('filters.availability')}</Label>
        </div>
        <div className="flex items-center gap-2">
          <Checkbox
            id="in-stock"
            checked={inStockOnly}
            onCheckedChange={(checked) => setInStockOnly(checked as boolean)}
          />
          <Label htmlFor="in-stock" className="cursor-pointer font-normal">
            {t('filters.inStockOnly')}
          </Label>
        </div>
      </div>

      {/* Reset Filters */}
      <Button
        variant="outline"
        className="w-full cursor-pointer border-accent/35 text-accent hover:bg-accent/10 hover:text-accent"
        onClick={resetFilters}
      >
        {t('resetFilters')}
      </Button>
    </div>
  );

  return (
    <div className="relative min-h-screen bg-background py-8">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-44 bg-gradient-to-r from-primary/10 via-secondary/10 to-accent/10" />
      <div className="container mx-auto px-4 scrollbar-hide">
        {/* Breadcrumb */}
        <div className="mb-6 text-sm text-muted-foreground">
          <Link href="/" className="cursor-pointer hover:text-primary">
            {t('breadcrumb.home')}
          </Link>
          {' / '}
          <Link href="/products" className="cursor-pointer hover:text-primary">
            {t('breadcrumb.products')}
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
          <h1 className="mb-4 text-3xl font-bold text-secondary dark:text-primary">
            {currentSubCategory
              ? currentSubCategory.name
              : currentCategory
              ? currentCategory.name
              : t('allProducts')}
          </h1>
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            <div className="relative flex-1 w-full md:max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t('searchPlaceholder')}
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2 w-full md:w-auto">
              {/* Mobile Filter Button */}
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" className="md:hidden flex-1 cursor-pointer">
                    <SlidersHorizontal className="h-4 w-4 mr-2" />
                    {t('filtersButton')}
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-[300px] p-0">
                  <SheetHeader>
                    <SheetTitle>{t('filtersTitle')}</SheetTitle>
                  </SheetHeader>
                  <ScrollArea className="h-[calc(100vh-8rem)] mt-4">
                    <div className="border-y px-4 py-4">
                      <FilterSection />
                    </div>
                  </ScrollArea>
                </SheetContent>
              </Sheet>

              {/* Sort */}
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                {/* Item count - on mobile it appears below sort controls (order-2), on desktop on the left (order-1) */}
                <p className="text-muted-foreground order-2 md:order-1">
                  {t('showingCount', { count: filteredProducts.length })}
                </p>

                {/* Sort controls container - on mobile appears above count (order-1), on desktop on the right (order-2) */}
                <div className="flex items-center gap-2 order-1 md:order-2">
                  <span className="text-sm font-medium text-muted-foreground whitespace-nowrap">
                    {t('sort.placeholder')} {/* e.g., "Sort by:" */}
                  </span>
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-full cursor-pointer md:w-[200px]" />
                    <SelectContent>
                      <SelectItem value="featured">{t('sort.featured')}</SelectItem>
                      <SelectItem value="price-low">{t('sort.priceLowHigh')}</SelectItem>
                      <SelectItem value="price-high">{t('sort.priceHighLow')}</SelectItem>
                      <SelectItem value="rating">{t('sort.highestRated')}</SelectItem>
                      <SelectItem value="name">{t('sort.nameAZ')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-[280px_1fr] gap-8">
          {/* Desktop Filters Sidebar */}
          <aside className="hidden lg:block">
            <Card className="sticky top-32 border-primary/20 shadow-sm">
              <CardContent className="p-6">
                <h2 className="font-semibold text-lg mb-4">{t('filtersTitle')}</h2>
                <ScrollArea className="h-[calc(100vh-16rem)] pr-4">
                  <FilterSection />
                </ScrollArea>
              </CardContent>
            </Card>
          </aside>

          {/* Products Grid */}
          <div>           
            {filteredProducts.length === 0 ? (
              <Card className="border-destructive/20 bg-card/95 p-12 text-center shadow-sm">
                <p className="text-muted-foreground mb-4">{t('noProductsFound')}</p>
                <Button
                  variant="outline"
                  className="cursor-pointer border-primary/30 hover:bg-primary/10"
                  onClick={resetFilters}
                >
                  {t('clearAllFilters')}
                </Button>
              </Card>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {paginatedProducts.map(product => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      showWholesalePrice={user?.is_company}
                    />
                  ))}
                </div>

                {totalPages > 1 && (
                  <div className="mt-8 flex items-center justify-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      disabled={safePage === 1}
                      onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                      aria-label="Previous page"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: totalPages }, (_, idx) => idx + 1).map((page) => (
                        <Button
                          key={page}
                          variant={page === safePage ? 'default' : 'outline'}
                          size="sm"
                          className="min-w-9"
                          onClick={() => setCurrentPage(page)}
                        >
                          {page}
                        </Button>
                      ))}
                    </div>
                    <Button
                      variant="outline"
                      size="icon"
                      disabled={safePage === totalPages}
                      onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                      aria-label="Next page"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductsPage;