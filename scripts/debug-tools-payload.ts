
import { config } from 'dotenv';
config({ path: '.env.local' });

async function debugToolsPayload() {
    const apiKey = process.env.VAPI_API_KEY;
    console.log('Using API Key:', apiKey ? apiKey.slice(0, 8) + '...' : 'MISSING');

    const webhookUrl = process.env.MAKE_COM_WEBHOOK_URL || "https://example.com/webhook";

    const tool = {
        type: 'function',
        function: {
            name: 'confirm_booking',
            description: 'Confirm booking',
            parameters: {
                type: 'object',
                properties: {
                    customer_name: { type: 'string' },
                    appointment_time: { type: 'string' },
                    shop_name: { type: 'string' }
                },
                required: ['customer_name']
            }
        },
        server: {
            url: webhookUrl
        }
    };

    const payload = {
        name: "Debug Assistant Tools V1",
        model: {
            provider: "openai",
            model: "gpt-3.5-turbo",
            systemPrompt: "You are a debug assistant."
        },
        firstMessage: "Hello.",
        tools: [tool]
    };

    try {
        const response = await fetch('https://api.vapi.ai/assistant', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify(payload)
        });

        console.log('Status:', response.status);
        const text = await response.text();
        console.log('Response Body:', text);
        const fs = await import('fs');
        fs.writeFileSync('api_response_tools.json', text);

    } catch (error) {
        console.error('Fetch Error:', error);
    }
}

debugToolsPayload();
