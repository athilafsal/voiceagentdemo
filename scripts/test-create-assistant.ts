
import { config } from 'dotenv';
import fs from 'fs';

config({ path: '.env.local' });

async function createTestAssistant() {
    const apiKey = process.env.VAPI_API_KEY;
    const toolId = process.env.VAPI_TOOL_ID;

    if (!apiKey || !toolId) {
        console.error('Missing API Key or Tool ID');
        return;
    }

    console.log('Creating Clean Assistant with ONLY toolIds...');

    const payload = {
        name: "Clean Test Assistant",
        model: {
            provider: "openai",
            model: "gpt-3.5-turbo",
            systemPrompt: "You are a test assistant. Call the confirm_booking tool.",
            toolIds: [toolId]
        },
        firstMessage: "Hello, this is a test. I am ready to book.",
    };

    try {
        const response = await fetch('https://api.vapi.ai/assistant', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        const data = await response.json();

        if (data.id) {
            console.log(`\n✅ NEW ASSISTANT ID: ${data.id}`);

            let envContent = fs.readFileSync('.env.local', 'utf-8');

            // Remove old lines if they exist to avoid duplicates
            const lines = envContent.split('\n');
            const newLines = lines.filter(line =>
                !line.startsWith('VAPI_ASSISTANT_ID=') &&
                !line.startsWith('NEXT_PUBLIC_VAPI_ASSISTANT_ID=')
            );

            newLines.push(`VAPI_ASSISTANT_ID=${data.id}`);
            newLines.push(`NEXT_PUBLIC_VAPI_ASSISTANT_ID=${data.id}`);

            fs.writeFileSync('.env.local', newLines.join('\n'));
            console.log('✅ Updated .env.local with new Assistant ID');

        } else {
            console.error('Failed to create assistant', data);
        }

    } catch (error) {
        console.error('Error:', error);
    }
}

createTestAssistant();
