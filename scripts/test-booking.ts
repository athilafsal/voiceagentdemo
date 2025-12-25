import { config } from 'dotenv';
config({ path: '.env.local' });

async function testBooking() {
  const webhookUrl = process.env.NEXTAUTH_URL 
    ? `${process.env.NEXTAUTH_URL}/api/webhook/make`
    : 'http://localhost:3000/api/webhook/make';

  console.log('Testing booking webhook at:', webhookUrl);

  // Test data
  const testBooking = {
    customer_name: 'John Doe',
    appointment_time: '2024-12-26T14:00:00-05:00',
    shop_name: 'Modern Barber',
  };

  // Test Vapi function call format
  const vapiFormat = {
    arguments: {
      customer_name: 'Jane Smith',
      appointment_time: '2024-12-27T10:00:00-05:00',
      shop_name: 'Family Dental',
    },
  };

  console.log('\n=== Test 1: Direct format ===');
  try {
    const response1 = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testBooking),
    });

    const result1 = await response1.json();
    console.log('Status:', response1.status);
    console.log('Response:', JSON.stringify(result1, null, 2));
  } catch (error) {
    console.error('Error:', error);
  }

  console.log('\n=== Test 2: Vapi function call format ===');
  try {
    const response2 = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(vapiFormat),
    });

    const result2 = await response2.json();
    console.log('Status:', response2.status);
    console.log('Response:', JSON.stringify(result2, null, 2));
  } catch (error) {
    console.error('Error:', error);
  }
}

testBooking();

