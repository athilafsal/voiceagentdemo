
import { config } from 'dotenv';
config({ path: '.env.local' });

async function debugVapi() {
    const apiKey = process.env.VAPI_API_KEY;
    console.log('Using API Key:', apiKey ? apiKey.slice(0, 8) + '...' : 'MISSING');
    console.log('Using Public Key:', process.env.NEXT_PUBLIC_VAPI_API_KEY ? process.env.NEXT_PUBLIC_VAPI_API_KEY.slice(0, 8) + '...' : 'MISSING');

    const payload = {
        name: "Debug Assistant",
        systemPrompt: "You are a debug assistant.",
        firstMessage: "Hello.",
        functions: [] // Empty functions to see if that works
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
        fs.writeFileSync('api_response.json', text);

    } catch (error) {
        console.error('Fetch Error:', error);
    }
}

debugVapi();
