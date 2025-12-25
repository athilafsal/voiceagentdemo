
import { config } from 'dotenv';
config({ path: '.env.local' });

async function debugVapiPayload() {
    const apiKey = process.env.VAPI_API_KEY;
    console.log('Using API Key:', apiKey ? apiKey.slice(0, 8) + '...' : 'MISSING');

    const payload = {
        name: "Debug Assistant V2",
        firstMessage: "Hello from V2.",
        model: {
            provider: "openai",
            model: "gpt-3.5-turbo",
            systemPrompt: "You are a verified debugging assistant."
        }
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
        console.log('Status Text:', response.statusText);

        const text = await response.text();
        console.log('Response Body:', text);
        const fs = await import('fs');
        fs.writeFileSync('api_response_v2.json', text);

    } catch (error) {
        console.error('Fetch Error:', error);
    }
}

debugVapiPayload();
