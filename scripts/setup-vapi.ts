#!/usr/bin/env tsx
/**
 * Setup script to configure Vapi assistant programmatically
 * Run with: npx tsx scripts/setup-vapi.ts
 */

import { config } from 'dotenv';
import { setupAssistant } from '../lib/vapi';

// Load environment variables
config({ path: '.env.local' });

async function main() {
  const assistantId = process.env.VAPI_ASSISTANT_ID;

  if (!process.env.VAPI_API_KEY) {
    console.error('❌ Error: VAPI_API_KEY is not set in .env.local');
    process.exit(1);
  }

  console.log('🚀 Setting up Vapi assistant...\n');

  try {
    const result = await setupAssistant(assistantId);

    console.log('✅ Success!\n');
    console.log(`📝 ${result.message}\n`);

    if (!assistantId) {
      console.log('⚠️  IMPORTANT: Add this to your .env.local file:\n');
      console.log(`VAPI_ASSISTANT_ID=${result.assistantId}\n`);
      console.log(`NEXT_PUBLIC_VAPI_ASSISTANT_ID=${result.assistantId}\n`);

      const fs = await import('fs');
      const envPath = '.env.local';
      let envContent = fs.readFileSync(envPath, 'utf8');

      // Remove existing ID lines if any
      envContent = envContent.replace(/^VAPI_ASSISTANT_ID=.*$/gm, '');
      envContent = envContent.replace(/^NEXT_PUBLIC_VAPI_ASSISTANT_ID=.*$/gm, '');

      // Add new IDs
      envContent += `\nVAPI_ASSISTANT_ID=${result.assistantId}`;
      envContent += `\nNEXT_PUBLIC_VAPI_ASSISTANT_ID=${result.assistantId}`;

      fs.writeFileSync(envPath, envContent);
      console.log('✅ Automatically updated .env.local');
    } else {
      console.log(`✅ Assistant ${result.assistantId} is now configured with:`);
      console.log('   - confirm_booking function');
      console.log('   - Canadianisms and Toronto-specific prompts');
      console.log('   - Webhook URL configured\n');
    }
  } catch (error) {
    console.error('❌ Error Details:', JSON.stringify(error, null, 2));
    if (error instanceof Error) {
      console.error('Message:', error.message);
      console.error('Stack:', error.stack);
    }
    process.exit(1);
  }
}

main();

