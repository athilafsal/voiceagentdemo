import { NextRequest, NextResponse } from 'next/server';
import { BookingData } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    const bookingData: BookingData = await request.json();

    // Validate required fields
    if (!bookingData.customer_name || !bookingData.appointment_time || !bookingData.shop_name) {
      return NextResponse.json(
        { error: 'Missing required fields: customer_name, appointment_time, shop_name' },
        { status: 400 }
      );
    }

    // Forward to Make.com webhook
    const makeWebhookUrl = process.env.MAKE_COM_WEBHOOK_URL;
    if (makeWebhookUrl) {
      try {
        const response = await fetch(makeWebhookUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(bookingData),
        });

        if (!response.ok) {
          console.error('Make.com webhook failed:', await response.text());
        }
      } catch (error) {
        console.error('Error calling Make.com webhook:', error);
        // Don't fail the request if Make.com is down
      }
    } else {
      console.log('Make.com webhook URL not configured. Booking data:', bookingData);
    }

    // Return success regardless of Make.com status
    return NextResponse.json({
      success: true,
      message: 'Booking received',
      booking: bookingData,
    });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

