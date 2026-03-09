"use client";

import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from '@/navigation';
import { useLocale } from "next-intl";
import { ArrowRight, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { useApp } from '@/contexts/AppContext';
import { fetchJson } from '@/lib/api';
import { useTranslations } from 'next-intl';

const deliveryOptions = [
  { id: 'courier', name: 'Courier delivery (1-2 days)', price: 9.99, description: 'Delivery to your address.' },
  { id: 'parcel_locker', name: 'Parcel locker (2-3 days)', price: 4.99, description: 'Pickup from nearest parcel locker.' },
  { id: 'store_pickup', name: 'Store pickup', price: 0, description: 'Collect your order in person.' },
];

const CheckoutPage: React.FC = () => {
  const router = useRouter();
  const locale = useLocale();
  const { user, cart } = useApp();
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [deliveryOption, setDeliveryOption] = useState(deliveryOptions[0].id);
  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    phone: '',
    street: '',
    city: '',
    postalCode: '',
    notes: '',
  });

  const t = useTranslations('checkout');

  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      email: user?.email || prev.email,
      firstName: user?.first_name?.split(' ')[0] || prev.firstName,
      lastName: user?.last_name || prev.lastName,
      phone: user?.phone || prev.phone,
      street: user?.address?.street || prev.street,
      city: user?.address?.city || prev.city,
      postalCode: user?.address?.postalCode || prev.postalCode,
    }));
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const subtotal = useMemo(() => {
    return cart.reduce((sum, item) => {
      const price = user?.is_company && item.product.wholesalePrice
        ? item.product.wholesalePrice
        : item.product.price;
      return sum + price * item.quantity;
    }, 0);
  }, [cart, user]);

  const shipping = useMemo(() => {
    const selected = deliveryOptions.find((option) => option.id === deliveryOption);
    return selected?.price ?? 0;
  }, [deliveryOption]);

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

      const items: Array<{ product_id: string | null; title: string; quantity: number; unit_price: number }> = cart.map((ci) => {
        const unit = user?.is_company && ci.product.wholesalePrice
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

      const orderPayload = {
        email: formData.email,
        phone: formData.phone,
        customer_name: `${formData.firstName} ${formData.lastName}`.trim(),
        address_line1: formData.street,
        address_line2: '',
        city: formData.city,
        postcode: formData.postalCode,
        country: 'LV',
        delivery_option: deliveryOption,
        items,
      };

      const res = await fetchJson<{ checkoutUrl: string; orderId: number }>(
        '/api/orders/payments/create-checkout-session/',
        {
          method: 'POST',
          csrf: true,
          body: {
            order: orderPayload,
            localePrefix: `/${locale}`,
            successPath: '/payment/status',
            cancelPath: '/checkout',
          },
        }
      );

      window.location.assign(res.checkoutUrl);
    } catch (err: unknown) {
      setSubmitError(err instanceof Error ? err.message : t('paymentInitFailed'));
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
          <span className="text-sm text-muted-foreground">{t('secureCheckout')}</span>
        </div>

        <h1 className="text-3xl font-bold mb-8">{t('title')}</h1>

        <form onSubmit={handleSubmit}>
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>{t('contact.title')}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="email">{t('contact.email')} *</Label>
                    <Input id="email" name="email" type="email" required value={formData.email} onChange={handleChange} placeholder={t('contact.emailPlaceholder')} />
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName">{t('contact.firstName')} *</Label>
                      <Input id="firstName" name="firstName" required value={formData.firstName} onChange={handleChange} />
                    </div>
                    <div>
                      <Label htmlFor="lastName">{t('contact.lastName')} *</Label>
                      <Input id="lastName" name="lastName" required value={formData.lastName} onChange={handleChange} />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="phone">{t('contact.phone')} *</Label>
                    <Input id="phone" name="phone" type="tel" required value={formData.phone} onChange={handleChange} placeholder={t('contact.phonePlaceholder')} />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader><CardTitle>{t('address.title')}</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="street">{t('address.street')} *</Label>
                    <Input id="street" name="street" required value={formData.street} onChange={handleChange} placeholder={t('address.streetPlaceholder')} />
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="city">{t('address.city')} *</Label>
                      <Input id="city" name="city" required value={formData.city} onChange={handleChange} />
                    </div>
                    <div>
                      <Label htmlFor="postalCode">{t('address.postalCode')} *</Label>
                      <Input id="postalCode" name="postalCode" required value={formData.postalCode} onChange={handleChange} placeholder={t('address.postalCodePlaceholder')} />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="notes">{t('address.notes')}</Label>
                    <Textarea id="notes" name="notes" value={formData.notes} onChange={handleChange} placeholder={t('address.notesPlaceholder')} rows={3} />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader><CardTitle>Delivery</CardTitle></CardHeader>
                <CardContent>
                  <RadioGroup value={deliveryOption} onValueChange={setDeliveryOption} className="space-y-3">
                    {deliveryOptions.map((option) => (
                      <label key={option.id} className="flex cursor-pointer items-start gap-3 rounded-md border p-3 hover:border-primary/50">
                        <RadioGroupItem value={option.id} className="mt-1" />
                        <div className="flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-medium">{option.name}</span>
                            <span>{option.price === 0 ? t('summary.free') : `€${option.price.toFixed(2)}`}</span>
                          </div>
                          <p className="text-sm text-muted-foreground">{option.description}</p>
                        </div>
                      </label>
                    ))}
                  </RadioGroup>
                </CardContent>
              </Card>
            </div>

            <div>
              <Card className="sticky top-24">
                <CardHeader><CardTitle>{t('summary.title')}</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3 max-h-[300px] overflow-y-auto">
                    {cart.map((item) => {
                      const displayPrice = user?.is_company && item.product.wholesalePrice ? item.product.wholesalePrice : item.product.price;
                      return (
                        <div key={item.product.id} className="flex gap-3">
                          <div className="relative"><div className="w-16 h-16 bg-muted rounded-md"></div><span className="absolute -top-2 -right-2 bg-primary text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">{item.quantity}</span></div>
                          <div className="flex-1 min-w-0"><p className="text-sm font-medium line-clamp-2">{item.product.name}</p><p className="text-sm text-muted-foreground">{t('summary.itemLine', { price: displayPrice.toFixed(2), quantity: item.quantity })}</p></div>
                          <div className="text-sm font-medium">€{(displayPrice * item.quantity).toFixed(2)}</div>
                        </div>
                      );
                    })}
                  </div>

                  <Separator />
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm"><span className="text-muted-foreground">{t('summary.subtotal')}</span><span>€{subtotal.toFixed(2)}</span></div>
                    <div className="flex justify-between text-sm"><span className="text-muted-foreground">{t('summary.shipping')}</span><span className={shipping === 0 ? 'text-green-600' : ''}>{shipping === 0 ? t('summary.free') : `€${shipping.toFixed(2)}`}</span></div>
                    <Separator />
                    <div className="flex justify-between font-bold text-lg"><span>{t('summary.total')}</span><span className="text-primary">€{total.toFixed(2)}</span></div>
                  </div>

                  <Button type="submit" size="lg" className="w-full bg-accent hover:bg-accent/90" disabled={submitting}>
                    {submitting ? t('summary.redirecting') : t('summary.payButton')}
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>

                  {submitError && <div className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md p-3">{submitError}</div>}
                  <p className="text-xs text-muted-foreground text-center">{t('termsNote')}</p>
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
