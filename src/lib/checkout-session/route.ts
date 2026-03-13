import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-02-25.clover',
});

const DJANGO_API_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

// Temporary mapping – replace with actual IDs from your Django DeliveryOption table
const DELIVERY_OPTION_ID_MAP: Record<string, number> = {
  courier: 1,
  parcel_locker: 2,
  store_pickup: 3,
};

export async function POST(request: Request) {
  try {
    const { order, localePrefix, successPath, cancelPath } = await request.json();

    // 1. Validate and map delivery option
    const deliveryOptionId = DELIVERY_OPTION_ID_MAP[order.delivery_option];
    if (!deliveryOptionId) {
      return NextResponse.json(
        { error: 'Invalid delivery option' },
        { status: 400 }
      );
    }

    // 2. Combine address fields into one string for Django's customer_address
    const customerAddress = [
      order.address_line1,
      order.address_line2,
      order.city,
      order.postcode,
      order.country,
    ]
      .filter(Boolean)
      .join(', ');

    // 3. Convert items: send unit_price in cents
    const itemsForDjango = order.items.map((item: any) => ({
      product_id: item.product_id,
      title: item.title,
      quantity: item.quantity,
      unit_price_cents: Math.round(item.unit_price * 100), // euros → cents
    }));

    // 4. Build payload for Django
    const djangoPayload = {
      email: order.email,
      phone: order.phone,                     // ensure Django model has this field
      customer_name: order.customer_name,
      customer_address: customerAddress,
      delivery_option_id: deliveryOptionId,   // use integer ID
      items: itemsForDjango,
    };

    console.log('🔵 Sending to Django:', JSON.stringify(djangoPayload, null, 2));

    // Forward the user's cookie for authentication (if logged in)
    const cookie = request.headers.get('cookie');

    // 5. Create order in Django
    const djangoRes = await fetch(`${DJANGO_API_URL}/api/orders/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(cookie && { Cookie: cookie }),
      },
      body: JSON.stringify(djangoPayload),
    });

    const responseText = await djangoRes.text();
    console.log('🔵 Django response status:', djangoRes.status);
    console.log('🔵 Django response body:', responseText);

    if (!djangoRes.ok) {
      let errorData;
      try {
        errorData = JSON.parse(responseText);
      } catch {
        errorData = { detail: responseText };
      }
      return NextResponse.json(
        { error: 'Failed to create order', details: errorData },
        { status: 502 }
      );
    }

    let djangoOrder;
    try {
      djangoOrder = JSON.parse(responseText);
    } catch {
      return NextResponse.json(
        { error: 'Invalid JSON from Django' },
        { status: 502 }
      );
    }

    const orderId = djangoOrder.id;

    // 6. Build line items for Stripe (prices in cents)
    const lineItems = order.items.map((item: any) => ({
      price_data: {
        currency: 'eur',
        product_data: { name: item.title },
        unit_amount: Math.round(item.unit_price * 100),
      },
      quantity: item.quantity,
    }));

    // 7. Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}${localePrefix}${successPath}/${orderId}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}${localePrefix}${cancelPath}`,
      customer_email: order.email,
      metadata: {
        order_id: orderId.toString(),
      },
    });

    return NextResponse.json({
      checkoutUrl: session.url,
      orderId: orderId,
    });
  } catch (error) {
    console.error('❌ Stripe session creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}