
import { config } from 'dotenv';
config({ path: '.env.local' });

async function getCallLogs() {
    const apiKey = process.env.VAPI_API_KEY;
    const assistantId = process.env.VAPI_ASSISTANT_ID;

    if (!apiKey || !assistantId) {
        console.error('Missing API Key or Assistant ID');
        return;
    }

    console.log(`Fetching logs for Assistant: ${assistantId}`);

    try {
        const response = await fetch(`https://api.vapi.ai/call?assistantId=${assistantId}&limit=5`, {
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

        const calls = await response.json();
        console.log(`Found ${calls.length} calls.`);

        const fs = await import('fs');
        fs.writeFileSync('call_logs.json', JSON.stringify(calls, null, 2));
        console.log('✅ Logs saved to call_logs.json');

        // Summary validation 
        for (const call of calls) {
            console.log(`Call ID: ${call.id}`);
            // Check messages for tool calls
            if (call.messages) {
                const toolCalls = call.messages.filter((m: any) => m.role === 'tool_calls' || m.function_call);
                if (toolCalls.length > 0) {
                    console.log('  Found tool use attempt!');
                    toolCalls.forEach((tc: any) => console.log('  - ', JSON.stringify(tc).substring(0, 100) + '...'));
                } else {
                    console.log('  No tool use found in messages.');
                }
            }
        }

    } catch (error) {
        console.error('Fetch Error:', error);
    }
}

getCallLogs();
