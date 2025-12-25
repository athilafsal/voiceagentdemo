import { config } from 'dotenv';
config({ path: '.env.local' });

async function testFullBooking() {
  console.log('🧪 Testing Full Booking Flow\n');
  console.log('='.repeat(50));

  // Calculate tomorrow at 4 PM in Eastern Time
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  // Set to 4 PM Eastern Time (UTC-5)
  // Create date string in Eastern Time format
  const year = tomorrow.getFullYear();
  const month = String(tomorrow.getMonth() + 1).padStart(2, '0');
  const day = String(tomorrow.getDate()).padStart(2, '0');
  
  // Format as ISO 8601 with Eastern Time offset (-05:00)
  const appointmentTime = `${year}-${month}-${day}T16:00:00-05:00`;
  
  const bookingData = {
    customer_name: 'Test Customer',
    appointment_time: appointmentTime,
    shop_name: 'Modern Barber',
  };

  console.log('📅 Booking Details:');
  console.log(`   Customer: ${bookingData.customer_name}`);
  console.log(`   Shop: ${bookingData.shop_name}`);
  console.log(`   Time: ${new Date(bookingData.appointment_time).toLocaleString()}`);
  console.log(`   Raw Time: ${bookingData.appointment_time}`);
  console.log('');

  const webhookUrl = process.env.NEXTAUTH_URL 
    ? `${process.env.NEXTAUTH_URL}/api/webhook/make`
    : 'http://localhost:3000/api/webhook/make';

  const makeWebhookUrl = process.env.MAKE_COM_WEBHOOK_URL;

  console.log('🔗 Webhook URLs:');
  console.log(`   Next.js Webhook: ${webhookUrl}`);
  console.log(`   Make.com Webhook: ${makeWebhookUrl || 'NOT CONFIGURED'}`);
  console.log('');

  // Test 1: Call Next.js webhook (simulating Vapi function call)
  console.log('📤 Step 1: Sending booking to Next.js webhook...');
  console.log('-'.repeat(50));
  
  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(bookingData),
    });

    const result = await response.json();
    
    if (response.ok) {
      console.log('✅ Next.js webhook responded successfully!');
      console.log('📋 Response:', JSON.stringify(result, null, 2));
      
      if (result.makeData) {
        console.log('\n📤 Step 2: Data prepared for Make.com:');
        console.log(`   Start: ${result.makeData.start}`);
        console.log(`   End: ${result.makeData.end}`);
        console.log(`   Summary: ${result.makeData.summary}`);
        console.log(`   Description: ${result.makeData.description}`);
      }

      // Test 2: Verify Make.com webhook is called
      if (makeWebhookUrl) {
        console.log('\n📤 Step 3: Testing Make.com webhook directly...');
        console.log('-'.repeat(50));
        
        try {
          const makeResponse = await fetch(makeWebhookUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(result.makeData),
          });

          const makeResult = await makeResponse.text();
          
          if (makeResponse.ok) {
            console.log('✅ Make.com webhook responded successfully!');
            console.log(`   Status: ${makeResponse.status}`);
            console.log(`   Response: ${makeResult.substring(0, 200)}...`);
          } else {
            console.log('❌ Make.com webhook failed!');
            console.log(`   Status: ${makeResponse.status}`);
            console.log(`   Error: ${makeResult}`);
          }
        } catch (error) {
          console.log('❌ Error calling Make.com webhook:');
          console.log(`   ${error instanceof Error ? error.message : String(error)}`);
        }
      } else {
        console.log('\n⚠️  Make.com webhook URL not configured - skipping direct test');
      }

      console.log('\n' + '='.repeat(50));
      console.log('✅ Booking test completed!');
      console.log('\n💡 Next steps:');
      console.log('   1. Check your Make.com scenario execution history');
      console.log('   2. Verify the Google Calendar event was created');
      console.log('   3. Check server logs for detailed information');
      
    } else {
      console.log('❌ Next.js webhook failed!');
      console.log(`   Status: ${response.status}`);
      console.log('   Response:', JSON.stringify(result, null, 2));
    }
  } catch (error) {
    console.log('❌ Error calling Next.js webhook:');
    console.log(`   ${error instanceof Error ? error.message : String(error)}`);
  }
}

testFullBooking();

