import { NextRequest, NextResponse } from 'next/server';
import { BookingData } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    const requestBody = await request.json();
    console.log('Received webhook request:', JSON.stringify(requestBody, null, 2));

    // Vapi sends function calls in different formats - handle both
    // Format 1: Direct parameters { customer_name, appointment_time, shop_name }
    // Format 2: Vapi function call format { arguments: { customer_name, ... } }
    // Format 3: Nested in functionCall object
    let bookingData: BookingData;
    
    if (requestBody.arguments) {
      // Vapi function call format with arguments
      bookingData = {
        customer_name: requestBody.arguments.customer_name || requestBody.arguments.customerName,
        appointment_time: requestBody.arguments.appointment_time || requestBody.arguments.appointmentTime,
        shop_name: requestBody.arguments.shop_name || requestBody.arguments.shopName,
      };
    } else if (requestBody.functionCall?.arguments) {
      // Nested function call format
      bookingData = {
        customer_name: requestBody.functionCall.arguments.customer_name || requestBody.functionCall.arguments.customerName,
        appointment_time: requestBody.functionCall.arguments.appointment_time || requestBody.functionCall.arguments.appointmentTime,
        shop_name: requestBody.functionCall.arguments.shop_name || requestBody.functionCall.arguments.shopName,
      };
    } else {
      // Direct format
      bookingData = {
        customer_name: requestBody.customer_name || requestBody.customerName,
        appointment_time: requestBody.appointment_time || requestBody.appointmentTime,
        shop_name: requestBody.shop_name || requestBody.shopName,
      };
    }

    console.log('Extracted booking data:', JSON.stringify(bookingData, null, 2));

    // Validate required fields
    if (!bookingData.customer_name || !bookingData.appointment_time || !bookingData.shop_name) {
      console.error('Missing required fields:', bookingData);
      return NextResponse.json(
        { error: 'Missing required fields: customer_name, appointment_time, shop_name' },
        { status: 400 }
      );
    }

    // Parse appointment_time and create start/end times for Google Calendar
    let startTime: string = bookingData.appointment_time;
    let endTime: string = '';
    
    try {
      const appointmentDate = new Date(bookingData.appointment_time);
      if (!isNaN(appointmentDate.getTime())) {
        // Use the appointment time as start
        startTime = appointmentDate.toISOString();
        // Add 1 hour for end time (default appointment duration)
        const endDate = new Date(appointmentDate);
        endDate.setHours(endDate.getHours() + 1);
        endTime = endDate.toISOString();
      }
    } catch (e) {
      console.warn('Could not parse appointment_time, using as-is:', e);
    }

    // Prepare data for Make.com - include both original format and Google Calendar format
    const makeData = {
      // Original fields
      customer_name: bookingData.customer_name,
      appointment_time: bookingData.appointment_time,
      shop_name: bookingData.shop_name,
      // Google Calendar compatible fields
      start: startTime,
      end: endTime || startTime, // Use start as end if parsing failed
      summary: `Appointment: ${bookingData.customer_name} - ${bookingData.shop_name}`,
      description: `Appointment booking for ${bookingData.customer_name} at ${bookingData.shop_name}`,
    };

    console.log('Sending to Make.com:', JSON.stringify(makeData, null, 2));

    // Forward to Make.com webhook
    const makeWebhookUrl = process.env.MAKE_COM_WEBHOOK_URL;
    if (makeWebhookUrl) {
      try {
        const response = await fetch(makeWebhookUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(makeData),
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error('Make.com webhook failed:', response.status, errorText);
        } else {
          console.log('Make.com webhook success:', response.status);
        }
      } catch (error) {
        console.error('Error calling Make.com webhook:', error);
        // Don't fail the request if Make.com is down
      }
    } else {
      console.log('Make.com webhook URL not configured. Booking data:', makeData);
    }

    // Return success regardless of Make.com status
    return NextResponse.json({
      success: true,
      message: 'Booking received',
      booking: bookingData,
      makeData: makeData, // Include transformed data in response for debugging
    });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

