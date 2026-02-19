"use client";

import React from 'react';
import { useRouter } from '@/navigation';
import { Star, Shield, Truck, Headphones, ArrowRight, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { categories, products } from '@/lib/mockData';
import { ImageWithFallback } from '@/components/figma/ImageWithFallback';
import { useTranslations } from 'next-intl';

const HomePage: React.FC = () => {
  const router = useRouter();
  const featuredProducts = products.slice(0, 4);
  const t = useTranslations('home');

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-secondary via-primary to-secondary/90 text-white py-20 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-20"></div>
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
                {t.rich('heroTitle', {
                  highlight: (chunks) => <span className="text-accent">{chunks}</span>
                })}
              </h1>
              <p className="text-lg md:text-xl text-white/90">
                {t('heroDescription')}
              </p>
              <div className="flex flex-wrap gap-4">
                <Button
                  size="lg"
                  onClick={() => router.push('/products')}
                  className="bg-accent hover:bg-accent/90 text-white"
                >
                  {t('shopNow')}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => router.push('/services')}
                  className="bg-white/10 text-white border-white/30 hover:bg-white/20"
                >
                  {t('ourServices')}
                </Button>
              </div>
              <div className="flex flex-wrap gap-8 pt-4">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-accent" />
                  <span>{t('freeShipping')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-accent" />
                  <span>{t('expertSupport')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-accent" />
                  <span>{t('qualityGuaranteed')}</span>
                </div>
              </div>
            </div>
            <div className="hidden md:block">
              <ImageWithFallback
                src="https://images.unsplash.com/photo-1511994501413-7752c87af739?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjbGVhbiUyMHdhdGVyJTIwZ2xhc3N8ZW58MXx8fHwxNzY4MzgyNjExfDA&ixlib=rb-4.1.0&q=80&w=1080"
                alt={t('heroImageAlt')}
                className="rounded-2xl shadow-2xl w-full h-[400px] object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <Card className="text-center border-none shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-6">
                <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="h-8 w-8 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">{t('features.quality.title')}</h3>
                <p className="text-sm text-muted-foreground">{t('features.quality.description')}</p>
              </CardContent>
            </Card>
            <Card className="text-center border-none shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-6">
                <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Truck className="h-8 w-8 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">{t('features.shipping.title')}</h3>
                <p className="text-sm text-muted-foreground">{t('features.shipping.description')}</p>
              </CardContent>
            </Card>
            <Card className="text-center border-none shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-6">
                <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Headphones className="h-8 w-8 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">{t('features.support.title')}</h3>
                <p className="text-sm text-muted-foreground">{t('features.support.description')}</p>
              </CardContent>
            </Card>
            <Card className="text-center border-none shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-6">
                <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Star className="h-8 w-8 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">{t('features.rating.title')}</h3>
                <p className="text-sm text-muted-foreground">{t('features.rating.description')}</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* All Products Banner */}
      <section className="py-12 bg-gradient-to-r from-secondary via-primary to-accent">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-white text-center md:text-left">
              <h2 className="text-3xl font-bold mb-2">{t('banner.title')}</h2>
              <p className="text-white/90 text-lg">{t('banner.description')}</p>
            </div>
            <Button
              size="lg"
              onClick={() => router.push('/products')}
              className="bg-white text-secondary hover:bg-white/90"
            >
              {t('banner.button')}
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* Categories Grid with Scrollable Container */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">{t('categories.title')}</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              {t('categories.description')}
            </p>
          </div>
          
          {/* Scrollable categories for mobile, grid for larger screens */}
          <div className="md:hidden overflow-x-auto pb-4">
            <div className="flex gap-4 min-w-max px-4">
              {categories.map((category) => (
                <Card
                  key={category.id}
                  className="cursor-pointer hover:shadow-lg transition-shadow border-2 hover:border-primary w-[280px] flex-shrink-0"
                  onClick={() => router.push(`/products?categoryId=${encodeURIComponent(category.id)}`)}
                >
                  <CardContent className="p-6 text-center">
                    <div className="bg-gradient-to-br from-primary to-secondary w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-3xl text-white">
                        {category.icon === 'droplet' ? '💧' : category.icon === 'cog' ? '⚙️' : category.icon === 'waves' ? '🌊' : category.icon === 'filter' ? '🔧' : category.icon === 'wrench' ? '🔨' : '🧪'}
                      </span>
                    </div>
                    <h3 className="font-semibold mb-2">{category.name}</h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      {t('categories.subcategoriesCount', { count: category.subCategories.length })}
                    </p>
                    <Button variant="outline" size="sm" className="w-full">
                      {t('categories.browse')}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Grid for desktop */}
          <div className="hidden md:grid grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((category) => (
              <Card
                key={category.id}
                className="cursor-pointer hover:shadow-lg transition-shadow border-2 hover:border-primary"
                onClick={() => router.push(`/products?categoryId=${encodeURIComponent(category.id)}`)}
              >
                <CardContent className="p-6 text-center">
                  <div className="bg-gradient-to-br from-primary to-secondary w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-3xl text-white">
                      {category.icon === 'droplet' ? '💧' : category.icon === 'cog' ? '⚙️' : category.icon === 'waves' ? '🌊' : category.icon === 'filter' ? '🔧' : category.icon === 'wrench' ? '🔨' : '🧪'}
                    </span>
                  </div>
                  <h3 className="font-semibold mb-2">{category.name}</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    {t('categories.subcategoriesCount', { count: category.subCategories.length })}
                  </p>
                  <Button variant="outline" size="sm" className="w-full">
                    {t('categories.browse')}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">{t('featured.title')}</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              {t('featured.description')}
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map((product) => {
              const productImageUrl = `https://source.unsplash.com/400x400/?${encodeURIComponent(product.image)}`;
              return (
                <Card
                  key={product.id}
                  className="cursor-pointer hover:shadow-lg transition-shadow group"
                  onClick={() => router.push(`/products/${encodeURIComponent(product.id)}`)}
                >
                  <CardContent className="p-0">
                    <div className="aspect-square bg-muted overflow-hidden rounded-t-lg">
                      <ImageWithFallback
                        src={productImageUrl}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <div className="p-4">
                      <div className="text-sm text-muted-foreground mb-1">{product.brand}</div>
                      <h3 className="font-semibold mb-2 line-clamp-2 h-12">{product.name}</h3>
                      <div className="flex items-center gap-1 mb-2">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${
                              i < Math.floor(product.rating)
                                ? 'fill-accent text-accent'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                        <span className="text-sm text-muted-foreground ml-1">
                          ({product.reviews})
                        </span>
                      </div>
                      <div className="flex items-baseline gap-2">
                        <span className="text-lg font-bold text-primary">€{product.price}</span>
                        {product.wholesalePrice && (
                          <span className="text-sm text-muted-foreground line-through">
                            €{product.wholesalePrice}
                          </span>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-16 bg-gradient-to-br from-muted/50 to-primary/5">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-6">{t('about.title')}</h2>
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="bg-primary/10 p-3 rounded-lg h-fit">
                    <CheckCircle className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">{t('about.quality.title')}</h3>
                    <p className="text-muted-foreground">{t('about.quality.description')}</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="bg-primary/10 p-3 rounded-lg h-fit">
                    <CheckCircle className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">{t('about.installation.title')}</h3>
                    <p className="text-muted-foreground">{t('about.installation.description')}</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="bg-primary/10 p-3 rounded-lg h-fit">
                    <CheckCircle className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">{t('about.support.title')}</h3>
                    <p className="text-muted-foreground">{t('about.support.description')}</p>
                  </div>
                </div>
              </div>
            </div>
            <div>
              <ImageWithFallback
                src="https://images.unsplash.com/photo-1676210134188-4c05dd172f89?w=600&h=400&fit=crop"
                alt={t('about.imageAlt')}
                className="rounded-xl shadow-xl w-full h-[400px] object-cover"
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;