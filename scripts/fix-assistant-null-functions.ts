
import { config } from 'dotenv';
config({ path: '.env.local' });

async function clearFunctions() {
    const apiKey = process.env.VAPI_API_KEY;
    const assistantId = process.env.VAPI_ASSISTANT_ID;

    if (!apiKey || !assistantId) {
        console.error('Missing API Key or Assistant ID');
        return;
    }

    console.log(`Clearing functions for Assistant ${assistantId}...`);

    try {
        const payload = {
            functions: null
        };

        const response = await fetch(`https://api.vapi.ai/assistant/${assistantId}`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        console.log(`Status: ${response.status} ${response.statusText}`);
        const text = await response.text();
        console.log('Response:', text);

    } catch (error) {
        console.error('Error:', error);
    }
}

clearFunctions();
