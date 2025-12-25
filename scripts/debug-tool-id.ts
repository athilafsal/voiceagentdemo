
import { config } from 'dotenv';


config({ path: '.env.local' });

async function linkTool() {
    const apiKey = process.env.VAPI_API_KEY;
    const assistantId = process.env.VAPI_ASSISTANT_ID;
    const toolId = "af097240-10fa-40c2-9842-4a860f40b1ad"; // User provided

    if (!apiKey || !assistantId) {
        console.error('Missing API Key or Assistant ID');
        return;
    }

    console.log(`Linking Tool ${toolId} to Assistant ${assistantId}...`);

    const payload = {
        model: {
            provider: 'openai',
            model: 'gpt-3.5-turbo',
            toolIds: [toolId]
        }
    };

    try {
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

linkTool();
