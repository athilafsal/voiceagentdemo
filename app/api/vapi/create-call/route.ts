import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createOutboundCall } from '@/lib/vapi';
import { validateCanadianPhoneNumber, formatCanadianPhoneNumber } from '@/lib/twilio';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { phoneNumber } = await request.json();

    if (!phoneNumber) {
      return NextResponse.json(
        { error: 'phoneNumber is required' },
        { status: 400 }
      );
    }

    // Validate Canadian phone number
    if (!validateCanadianPhoneNumber(phoneNumber)) {
      return NextResponse.json(
        { error: 'Invalid Canadian phone number format' },
        { status: 400 }
      );
    }

    const formattedNumber = formatCanadianPhoneNumber(phoneNumber);
    const assistantId = process.env.VAPI_ASSISTANT_ID;
    const phoneNumberId = process.env.VAPI_PHONE_NUMBER_ID; // Optional: Twilio phone number ID in Vapi

    if (!assistantId) {
      return NextResponse.json(
        { error: 'VAPI_ASSISTANT_ID is not configured' },
        { status: 500 }
      );
    }

    const call = await createOutboundCall(assistantId, formattedNumber, phoneNumberId);

    return NextResponse.json({
      success: true,
      callId: call.callId,
      status: call.status,
      phoneNumber: formattedNumber,
    });
  } catch (error) {
    console.error('Error creating call:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

