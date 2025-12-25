import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { setupAssistant } from '@/lib/vapi';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    // Use assistantId from request body, or fall back to environment variable
    const assistantId = body.assistantId || process.env.VAPI_ASSISTANT_ID;

    if (!assistantId) {
      return NextResponse.json(
        { error: 'Assistant ID is required. Please set VAPI_ASSISTANT_ID in .env.local or provide it in the request.' },
        { status: 400 }
      );
    }

    const result = await setupAssistant(assistantId);

    return NextResponse.json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error('Error setting up assistant:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

