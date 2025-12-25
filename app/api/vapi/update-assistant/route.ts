import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { updateAssistant } from '@/lib/vapi';
import { getPersonaById } from '@/lib/personas';
import { buildCanadianPrompt } from '@/lib/persona-builder';
import { PersonaCustomization } from '@/lib/types';

export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { personaId, customization } = await request.json();

    if (!personaId) {
      return NextResponse.json(
        { error: 'personaId is required' },
        { status: 400 }
      );
    }

    const persona = getPersonaById(personaId);
    if (!persona) {
      return NextResponse.json(
        { error: 'Invalid persona ID' },
        { status: 400 }
      );
    }

    const assistantId = process.env.VAPI_ASSISTANT_ID;
    if (!assistantId) {
      return NextResponse.json(
        { error: 'VAPI_ASSISTANT_ID is not configured' },
        { status: 500 }
      );
    }

    // Build custom prompt with Canadianisms if customization provided
    let customPrompt = persona.systemPrompt;
    if (customization && (customization.companyName || customization.service)) {
      const custom: PersonaCustomization = {
        companyName: customization.companyName || persona.displayName,
        service: customization.service || persona.description,
        address: customization.address,
        phoneNumber: customization.phoneNumber,
      };
      customPrompt = buildCanadianPrompt(persona, custom);
    } else {
      // Apply default Canadianisms even without customization
      const defaultCustom: PersonaCustomization = {
        companyName: persona.displayName,
        service: persona.description,
      };
      customPrompt = buildCanadianPrompt(persona, defaultCustom);
    }

    // Create a temporary persona with the custom prompt
    const customPersona = {
      ...persona,
      systemPrompt: customPrompt,
    };

    // Always include the confirm_booking function when updating
    const updatedAssistant = await updateAssistant(assistantId, customPersona, true);

    return NextResponse.json({
      success: true,
      assistant: updatedAssistant,
      persona: persona.name,
    });
  } catch (error) {
    console.error('Error updating assistant:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

