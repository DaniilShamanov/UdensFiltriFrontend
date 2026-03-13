import { NextResponse } from 'next/server';
import { Order } from '@/lib/types';

const DJANGO_API_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export async function GET(
  request: Request,
  { params }: { params: { orderId: string } }
) {
  const { orderId } = params;

  try {
    // Forward the user's cookie (if any) to Django for authentication
    const cookie = request.headers.get('cookie');

    const response = await fetch(`${DJANGO_API_URL}/api/orders/${orderId}/`, {
      headers: {
        'Content-Type': 'application/json',
        ...(cookie && { Cookie: cookie }),
      },
    });

    if (!response.ok) {
      // If Django returns 404, return 404 to the frontend
      if (response.status === 404) {
        return NextResponse.json(
          { error: 'Order not found' },
          { status: 404 }
        );
      }
      return NextResponse.json(
        { error: 'Failed to fetch order' },
        { status: response.status }
      );
    }

    const djangoOrder = await response.json();

    // Parse combined address (naive split by comma)
    const addressParts = djangoOrder.customer_address.split(',').map((s: string) => s.trim());
    const [street = '', city = '', postalCode = '', country = ''] = addressParts;

    // Map Django status to frontend status
    let status: Order['status'];
    switch (djangoOrder.status) {
      case 'created':
        status = 'pending';
        break;
      case 'paid':
        status = 'processing'; // or 'paid' if you have a matching translation
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
        id: item.product_id || `item-${item.id}`, // fallback
        name: item.title,
        price: item.unit_price_cents / 100,        // convert cents to euros
        wholesalePrice: item.unit_price_cents / 100, // same for consistency
      },
      quantity: item.quantity,
    }));

    const frontendOrder: Order = {
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

    return NextResponse.json(frontendOrder);
  } catch (error) {
    console.error('Error fetching order from Django:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}