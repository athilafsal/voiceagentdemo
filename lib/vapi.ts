import { Persona } from './types';

const VAPI_API_URL = 'https://api.vapi.ai';

export interface VapiAssistant {
  id: string;
  name?: string;
  systemPrompt?: string;
  firstMessage?: string;
  functions?: VapiFunction[];
  tools?: VapiTool[];
}

export interface VapiFunction {
  name: string;
  description?: string;
  parameters: {
    type: string;
    properties: Record<string, any>;
    required?: string[];
  };
  serverUrl?: string;
  serverUrlSecret?: string;
}

export interface VapiTool {
  type: string;
  function: VapiFunction;
}

export interface VapiCallRequest {
  assistantId: string;
  phoneNumberId?: string;
  customer?: {
    number: string;
  };
}

export function getConfirmBookingFunction(): VapiFunction {
  const webhookUrl = process.env.MAKE_COM_WEBHOOK_URL
    ? process.env.MAKE_COM_WEBHOOK_URL
    : process.env.NEXTAUTH_URL
      ? `${process.env.NEXTAUTH_URL}/api/webhook/make`
      : '';

  return {
    name: 'confirm_booking',
    description: 'Confirm and book an appointment for a customer. Use this when the customer wants to schedule an appointment.',
    parameters: {
      type: 'object',
      properties: {
        customer_name: {
          type: 'string',
          description: 'The customer\'s full name',
        },
        appointment_time: {
          type: 'string',
          description: 'The appointment date and time in ISO 8601 format (e.g., 2024-01-15T10:00:00-05:00 for Eastern Time)',
        },
        shop_name: {
          type: 'string',
          description: 'The name of the business/shop',
        },
      },
      required: ['customer_name', 'appointment_time', 'shop_name'],
    },
    serverUrl: webhookUrl,
  };
}

export async function updateAssistant(
  assistantId: string,
  persona: Persona,
  includeFunction: boolean = true
): Promise<VapiAssistant> {
  const apiKey = process.env.VAPI_API_KEY;
  if (!apiKey) {
    throw new Error('VAPI_API_KEY is not set');
  }

  // Extract company name from system prompt or use displayName
  const companyNameMatch = persona.systemPrompt.match(/for ([^,]+)/i) ||
    persona.systemPrompt.match(/from ([^,]+)/i);
  const companyName = companyNameMatch ? companyNameMatch[1].trim() : persona.displayName;

  const toolId = process.env.VAPI_TOOL_ID;

  const updateData: any = {
    name: persona.assistantName,
    model: {
      provider: 'openai',
      model: 'gpt-3.5-turbo',
      systemPrompt: persona.systemPrompt,
      ...(toolId ? { toolIds: [toolId] } : {}),
    },
    firstMessage: `Hello there! This is ${persona.assistantName} from ${companyName}. How can I help you today?`,
  };

  // Legacy support: Add the confirm_booking function if requested AND no toolId is present
  if (includeFunction && !toolId) {
    updateData.functions = [getConfirmBookingFunction()];
  } else {
    // Explicitly clear functions if we are using toolIds to avoid conflicts
    updateData.functions = [];
  }

  const response = await fetch(`${VAPI_API_URL}/assistant/${assistantId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(updateData),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to update assistant: ${error}`);
  }

  return response.json();
}

export async function createAssistant(
  name: string,
  systemPrompt: string,
  firstMessage: string,
  voiceId?: string
): Promise<VapiAssistant> {
  const apiKey = process.env.VAPI_API_KEY;
  if (!apiKey) {
    throw new Error('VAPI_API_KEY is not set');
  }

  const createData: any = {
    name,
    model: {
      provider: 'openai',
      model: 'gpt-3.5-turbo',
      systemPrompt,
    },
    firstMessage,
    functions: [getConfirmBookingFunction()],
  };

  if (voiceId) {
    createData.voice = { provider: '11labs', voiceId };
  }

  const response = await fetch(`${VAPI_API_URL}/assistant`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(createData),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to create assistant: ${error}`);
  }

  return response.json();
}

export async function setupAssistant(assistantId?: string): Promise<{ assistantId: string; message: string }> {
  const apiKey = process.env.VAPI_API_KEY;
  if (!apiKey) {
    throw new Error('VAPI_API_KEY is not set');
  }

  // If assistantId is provided, update it; otherwise create a new one
  if (assistantId) {
    // Get default persona for initial setup
    const { personas } = await import('./personas');
    const defaultPersona = personas[0];
    const { buildCanadianPrompt } = await import('./persona-builder');

    const customPrompt = buildCanadianPrompt(defaultPersona, {
      companyName: defaultPersona.displayName,
      service: defaultPersona.description,
    });

    const customPersona = {
      ...defaultPersona,
      systemPrompt: customPrompt,
    };

    await updateAssistant(assistantId, customPersona, true);

    return {
      assistantId,
      message: `Assistant ${assistantId} configured successfully with confirm_booking function`,
    };
  } else {
    // Create new assistant
    const { personas } = await import('./personas');
    const defaultPersona = personas[0];
    const { buildCanadianPrompt } = await import('./persona-builder');

    const customPrompt = buildCanadianPrompt(defaultPersona, {
      companyName: defaultPersona.displayName,
      service: defaultPersona.description,
    });

    const assistant = await createAssistant(
      defaultPersona.assistantName,
      customPrompt,
      `Hello there! This is ${defaultPersona.assistantName} from ${defaultPersona.displayName}. How can I help you today?`
    );

    return {
      assistantId: assistant.id,
      message: `New assistant created with ID: ${assistant.id}. Add this to your .env.local as VAPI_ASSISTANT_ID`,
    };
  }
}

export async function createOutboundCall(
  assistantId: string,
  phoneNumber: string,
  phoneNumberId?: string
): Promise<{ callId: string; status: string }> {
  const apiKey = process.env.VAPI_API_KEY;
  if (!apiKey) {
    throw new Error('VAPI_API_KEY is not set');
  }

  const callData: VapiCallRequest = {
    assistantId,
    customer: {
      number: phoneNumber,
    },
  };

  if (phoneNumberId) {
    callData.phoneNumberId = phoneNumberId;
  }

  const response = await fetch(`${VAPI_API_URL}/call`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(callData),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to create call: ${error}`);
  }

  const result = await response.json();
  return {
    callId: result.id,
    status: result.status,
  };
}
