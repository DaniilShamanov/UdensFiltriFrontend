"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { Package, Search, Calendar, DollarSign, TrendingUp, ChevronDown } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { useApp } from '@/contexts/AppContext';
import { usePathname, useRouter } from '@/navigation';
import { Order } from '@/lib/types';
import { useTranslations } from 'next-intl';

const OrdersPage: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { user, orders, authLoading } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date-desc');
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

  const t = useTranslations('orders');

  useEffect(() => {
    if (!authLoading && !user) {
      const next = encodeURIComponent(pathname);
      router.replace(`/auth/sign-in?next=${next}`);
    }
  }, [user, authLoading, router, pathname]);

  if (authLoading) return <p>Loading</p>;
  if (!user) return null; // will redirect via effect

  const filteredOrders = useMemo(() => {
    let result = [...orders];

    // Search filter
    if (searchQuery) {
      result = result.filter(order =>
        order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.items.some(item => 
          item.product.name.toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      result = result.filter(order => order.status === statusFilter);
    }

    // Sort
    switch (sortBy) {
      case 'date-desc':
        result.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        break;
      case 'date-asc':
        result.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        break;
      case 'total-desc':
        result.sort((a, b) => b.total - a.total);
        break;
      case 'total-asc':
        result.sort((a, b) => a.total - b.total);
        break;
    }

    return result;
  }, [orders, searchQuery, statusFilter, sortBy]);

  const totalSpent = orders.reduce((sum, order) => sum + order.total, 0);
  const orderCount = orders.length;

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-500';
      case 'processing':
        return 'bg-blue-500';
      case 'shipped':
        return 'bg-purple-500';
      case 'delivered':
        return 'bg-green-500';
      case 'cancelled':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  // Status labels are now taken from translations (filter keys)
  const getStatusLabel = (status: Order['status']) => {
    switch (status) {
      case 'pending': return t('filter.pending');
      case 'processing': return t('filter.processing');
      case 'shipped': return t('filter.shipped');
      case 'delivered': return t('filter.delivered');
      case 'cancelled': return t('filter.cancelled');
      default: return status;
    }
  };

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">{t('pageTitle')}</h1>
          <p className="text-muted-foreground">{t('pageDescription')}</p>
        </div>

        {/* Statistics */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">{t('stats.totalOrders')}</p>
                  <p className="text-3xl font-bold">{orderCount}</p>
                </div>
                <div className="bg-primary/10 p-3 rounded-lg">
                  <Package className="h-8 w-8 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-accent/5 to-accent/10 border-accent/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">{t('stats.totalSpent')}</p>
                  <p className="text-3xl font-bold">€{totalSpent.toFixed(2)}</p>
                </div>
                <div className="bg-accent/10 p-3 rounded-lg">
                  <DollarSign className="h-8 w-8 text-accent" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500/5 to-green-500/10 border-green-500/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">{t('stats.averageOrder')}</p>
                  <p className="text-3xl font-bold">
                    €{orderCount > 0 ? (totalSpent / orderCount).toFixed(2) : '0.00'}
                  </p>
                </div>
                <div className="bg-green-500/10 p-3 rounded-lg">
                  <TrendingUp className="h-8 w-8 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={t('searchPlaceholder')}
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-[200px]"/>
                <SelectContent>
                  <SelectItem value="all">{t('filter.allStatus')}</SelectItem>
                  <SelectItem value="pending">{t('filter.pending')}</SelectItem>
                  <SelectItem value="processing">{t('filter.processing')}</SelectItem>
                  <SelectItem value="shipped">{t('filter.shipped')}</SelectItem>
                  <SelectItem value="delivered">{t('filter.delivered')}</SelectItem>
                  <SelectItem value="cancelled">{t('filter.cancelled')}</SelectItem>
                </SelectContent>
              </Select>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-full md:w-[200px]"/>
                <SelectContent>
                  <SelectItem value="date-desc">{t('sort.newest')}</SelectItem>
                  <SelectItem value="date-asc">{t('sort.oldest')}</SelectItem>
                  <SelectItem value="total-desc">{t('sort.highestTotal')}</SelectItem>
                  <SelectItem value="total-asc">{t('sort.lowestTotal')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Orders List */}
        {filteredOrders.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">{t('empty.title')}</h3>
              <p className="text-muted-foreground mb-6">
                {orders.length === 0
                  ? t('empty.noOrdersYet')
                  : t('empty.adjustFilters')}
              </p>
              {orders.length === 0 && (
                <Button onClick={() => router.push('/products')} className="bg-accent hover:bg-accent/90">
                  {t('empty.startShopping')}
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map(order => {
              const isExpanded = expandedOrder === order.id;
              return (
                <Card key={order.id} className="overflow-hidden">
                  <CardHeader 
                    className="cursor-pointer hover:bg-muted/30 transition-colors"
                    onClick={() => setExpandedOrder(isExpanded ? null : order.id)}
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <CardTitle className="text-lg font-mono">{order.id}</CardTitle>
                          <Badge className={getStatusColor(order.status)}>
                            {getStatusLabel(order.status)}
                          </Badge>
                        </div>
                        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {new Date(order.date).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                            })}
                          </div>
                          <div className="flex items-center gap-1">
                            <Package className="h-4 w-4" />
                            {t('orderCard.itemsCount', { count: order.items.length })}
                          </div>
                          <div className="flex items-center gap-1">
                            <DollarSign className="h-4 w-4" />
                            €{order.total.toFixed(2)}
                          </div>
                        </div>
                      </div>
                      <ChevronDown 
                        className={`h-5 w-5 text-muted-foreground transition-transform ${
                          isExpanded ? 'rotate-180' : ''
                        }`}
                      />
                    </div>
                  </CardHeader>
                  
                  {isExpanded && (
                    <CardContent className="pt-0">
                      <Separator className="mb-4" />
                      
                      {/* Order Items */}
                      <div className="space-y-3 mb-4">
                        <h4 className="font-semibold">{t('orderCard.orderItems')}</h4>
                        {order.items.map(item => {
                          const price = user?.is_company && item.product.wholesalePrice
                            ? item.product.wholesalePrice
                            : item.product.price;
                          return (
                            <div key={item.product.id} className="flex items-center gap-4 p-3 bg-muted/30 rounded-lg">
                              <div className="w-16 h-16 bg-muted rounded-md"></div>
                              <div className="flex-1">
                                <p className="font-medium">{item.product.name}</p>
                                <p className="text-sm text-muted-foreground">
                                  {t('orderCard.quantityLabel', { 
                                    quantity: item.quantity, 
                                    price: price.toFixed(2) 
                                  })}
                                </p>
                              </div>
                              <p className="font-semibold">
                                €{(price * item.quantity).toFixed(2)}
                              </p>
                            </div>
                          );
                        })}
                      </div>

                      <Separator className="my-4" />

                      {/* Shipping Address */}
                      <div>
                        <h4 className="font-semibold mb-2">{t('orderCard.shippingAddress')}</h4>
                        <p className="text-sm text-muted-foreground">
                          {order.shippingAddress.street}<br />
                          {order.shippingAddress.city}, {order.shippingAddress.postalCode}<br />
                          {order.shippingAddress.country}
                        </p>
                      </div>
                    </CardContent>
                  )}
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrdersPage;