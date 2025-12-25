
import { config } from 'dotenv';
config({ path: '.env.local' });

async function checkAssistant() {
    const apiKey = process.env.VAPI_API_KEY;
    const assistantId = process.env.VAPI_ASSISTANT_ID;

    if (!apiKey || !assistantId) {
        console.error('Missing API Key or Assistant ID');
        return;
    }

    console.log(`Checking Assistant ID: ${assistantId}`);

    try {
        const response = await fetch(`https://api.vapi.ai/assistant/${assistantId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            console.error(`Error: ${response.status} ${response.statusText}`);
            const text = await response.text();
            console.error(text);
            return;
        }

        const data = await response.json();
        console.log('--- Assistant Configuration ---');
        console.log('Name:', data.name);
        console.log('Model:', JSON.stringify(data.model, null, 2));

        const fs = await import('fs');
        fs.writeFileSync('assistant_config.json', JSON.stringify(data, null, 2));
        console.log('✅ Configuration saved to assistant_config.json');

        console.log('\n--- Model Configuration ---');
        console.log(JSON.stringify(data.model, null, 2));

        if (data.model?.toolIds) {
            console.log(`\n✅ Tool IDs Found: ${JSON.stringify(data.model.toolIds)}`);
        } else {
            console.log('\n❌ No toolIds found in model!');
        }

        if (data.functions) {
            console.log('\n--- Functions ---');
            data.functions.forEach((fn: any) => {
                console.log(`- Name: ${fn.name}`);
                console.log(`  Server URL: ${fn.serverUrl}`);
            });
        } else {
            console.log('\n❌ No functions found!');
        }

    } catch (error) {
        console.error('Fetch Error:', error);
    }
}

checkAssistant();
