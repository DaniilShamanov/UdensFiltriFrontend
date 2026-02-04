"use client";

import React, { useMemo, useState } from 'react';
import { useRouter } from '@/navigation';
import { ArrowRight, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { useApp } from '@/contexts/AppContext';
import { fetchJson } from '@/lib/api';

const CheckoutPage: React.FC = () => {
  const router = useRouter();
  const { user, cart } = useApp();
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    email: user?.email || '',
    firstName: user?.name?.split(' ')[0] || '',
    lastName: user?.name?.split(' ')[1] || '',
    phone: user?.phone || '',
    street: user?.address?.street || '',
    city: user?.address?.city || '',
    postalCode: user?.address?.postalCode || '',
    country: user?.address?.country || 'Latvia',
    notes: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const subtotal = useMemo(() => {
    return cart.reduce((sum, item) => {
      const price = user?.isWholesale && item.product.wholesalePrice
        ? item.product.wholesalePrice
        : item.product.price;
      return sum + price * item.quantity;
    }, 0);
  }, [cart, user]);

  const shipping = subtotal > 100 ? 0 : 9.99;
  const total = subtotal + shipping;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    if (cart.length === 0) {
      router.push('/cart');
      return;
    }

    try {
      setSubmitting(true);

      const items: Array<any> = cart.map((ci) => {
        const unit = user?.isWholesale && ci.product.wholesalePrice
          ? ci.product.wholesalePrice
          : ci.product.price;
        return {
          product_id: ci.product.id,
          title: ci.product.name,
          quantity: ci.quantity,
          unit_price: unit,
        };
      });

      if (shipping > 0) {
        items.push({
          product_id: null,
          title: 'Shipping',
          quantity: 1,
          unit_price: shipping,
        });
      }

      const countryCode = (formData.country || 'LV').trim();
      const country = countryCode.length === 2 ? countryCode.toUpperCase() : 'LV';

      const orderPayload = {
        email: formData.email,
        phone: formData.phone,
        customer_name: `${formData.firstName} ${formData.lastName}`.trim(),
        address_line1: formData.street,
        address_line2: '',
        city: formData.city,
        postcode: formData.postalCode,
        country,
        items,
      };

      const res = await fetchJson<{ checkoutUrl: string; orderId: number }>(
        '/api/orders/payments/create-checkout-session/',
        {
          method: 'POST',
          csrf: true,
          body: {
            order: orderPayload,
            localePrefix: `/${router.locale}`,
            successPath: '/payment/status',
            cancelPath: '/checkout',
          },
        }
      );

      window.location.assign(res.checkoutUrl);
    } catch (err: any) {
      setSubmitError(err?.message || 'Payment initialization failed');
      setSubmitting(false);
    }
  };

  if (cart.length === 0) {
    router.push('/cart');
    return null;
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="flex items-center gap-2 mb-8">
          <Lock className="h-5 w-5 text-green-600" />
          <span className="text-sm text-muted-foreground">Secure Checkout</span>
        </div>

        <h1 className="text-3xl font-bold mb-8">Checkout</h1>

        <form onSubmit={handleSubmit}>
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Contact Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Contact Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="email">Email Address *</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="your.email@example.com"
                    />
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName">First Name *</Label>
                      <Input
                        id="firstName"
                        name="firstName"
                        required
                        value={formData.firstName}
                        onChange={handleChange}
                      />
                    </div>
                    <div>
                      <Label htmlFor="lastName">Last Name *</Label>
                      <Input
                        id="lastName"
                        name="lastName"
                        required
                        value={formData.lastName}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone Number *</Label>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="+371 12345678"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Shipping Address */}
              <Card>
                <CardHeader>
                  <CardTitle>Shipping Address</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="street">Street Address *</Label>
                    <Input
                      id="street"
                      name="street"
                      required
                      value={formData.street}
                      onChange={handleChange}
                      placeholder="123 Main Street, Apt 4B"
                    />
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="city">City *</Label>
                      <Input
                        id="city"
                        name="city"
                        required
                        value={formData.city}
                        onChange={handleChange}
                      />
                    </div>
                    <div>
                      <Label htmlFor="postalCode">Postal Code *</Label>
                      <Input
                        id="postalCode"
                        name="postalCode"
                        required
                        value={formData.postalCode}
                        onChange={handleChange}
                        placeholder="LV-1234"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="country">Country *</Label>
                    <Input
                      id="country"
                      name="country"
                      required
                      value={formData.country}
                      onChange={handleChange}
                    />
                  </div>
                  <div>
                    <Label htmlFor="notes">Delivery Notes (Optional)</Label>
                    <Textarea
                      id="notes"
                      name="notes"
                      value={formData.notes}
                      onChange={handleChange}
                      placeholder="Any special instructions for delivery..."
                      rows={3}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Order Summary */}
            <div>
              <Card className="sticky top-24">
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Cart Items */}
                  <div className="space-y-3 max-h-[300px] overflow-y-auto">
                    {cart.map((item) => {
                      const displayPrice = user?.isWholesale && item.product.wholesalePrice
                        ? item.product.wholesalePrice
                        : item.product.price;
                      return (
                        <div key={item.product.id} className="flex gap-3">
                          <div className="relative">
                            <div className="w-16 h-16 bg-muted rounded-md"></div>
                            <span className="absolute -top-2 -right-2 bg-primary text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                              {item.quantity}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium line-clamp-2">{item.product.name}</p>
                            <p className="text-sm text-muted-foreground">
                              €{displayPrice.toFixed(2)} × {item.quantity}
                            </p>
                          </div>
                          <div className="text-sm font-medium">
                            €{(displayPrice * item.quantity).toFixed(2)}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <Separator />

                  {/* Totals */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span>€{subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Shipping</span>
                      <span className={shipping === 0 ? 'text-green-600' : ''}>
                        {shipping === 0 ? 'FREE' : `€${shipping.toFixed(2)}`}
                      </span>
                    </div>
                    <Separator />
                    <div className="flex justify-between font-bold text-lg">
                      <span>Total</span>
                      <span className="text-primary">€{total.toFixed(2)}</span>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    size="lg"
                    className="w-full bg-accent hover:bg-accent/90"
                    disabled={submitting}
                  >
                    {submitting ? 'Redirecting to Stripe…' : 'Pay securely with Stripe'}
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>

                  {submitError && (
                    <div className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md p-3">
                      {submitError}
                    </div>
                  )}

                  {submitError && (
                    <p className="text-sm text-red-600 text-center">{submitError}</p>
                  )}

                  <p className="text-xs text-muted-foreground text-center">
                    By placing your order, you agree to our Terms and Conditions
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CheckoutPage;
