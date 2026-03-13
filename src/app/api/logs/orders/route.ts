import { NextResponse } from 'next/server';
import { Order } from '@/lib/types';

const DJANGO_API_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export async function GET(request: Request) {
  try {
    const cookie = request.headers.get('cookie');
    const response = await fetch(`${DJANGO_API_URL}/api/orders/`, {
      headers: {
        'Content-Type': 'application/json',
        ...(cookie && { Cookie: cookie }),
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch orders' },
        { status: response.status }
      );
    }

    const djangoOrders = await response.json();

    // Transform each order to match frontend Order type
    const transformedOrders = djangoOrders.map((djangoOrder: any) => {
      // Parse combined address into components (naive split by comma)
      const addressParts = djangoOrder.customer_address.split(',').map((s: string) => s.trim());
      const [street = '', city = '', postalCode = '', country = ''] = addressParts;

      // Map Django status to frontend status
      let status: Order['status'];
      switch (djangoOrder.status) {
        case 'created':
          status = 'pending';
          break;
        case 'paid':
          status = 'processing'; // or you could keep 'paid' and adjust translations
          break;
        case 'cancelled':
          status = 'cancelled';
          break;
        default:
          status = 'pending';
      }

      // Transform items
      const items = djangoOrder.items.map((item: any) => ({
        product: {
          id: item.product_id || `item-${item.id}`, // fallback if no product_id
          name: item.title,
          price: item.unit_price_cents / 100,       // convert cents to euros
          wholesalePrice: item.unit_price_cents / 100, // same for consistency
        },
        quantity: item.quantity,
      }));

      return {
        id: djangoOrder.id.toString(),
        date: djangoOrder.created_at,
        status,
        total: djangoOrder.total_cents / 100,
        items,
        shippingAddress: {
          street,
          city,
          postalCode,
          country,
        },
      };
    });

    return NextResponse.json(transformedOrders);
  } catch (error) {
    console.error('Error fetching orders from Django:', error);
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}