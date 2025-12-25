import twilio from 'twilio';

let twilioClient: twilio.Twilio | null = null;

export function getTwilioClient(): twilio.Twilio {
  if (twilioClient) {
    return twilioClient;
  }

  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;

  if (!accountSid || !authToken) {
    throw new Error('Twilio credentials are not configured');
  }

  twilioClient = twilio(accountSid, authToken);
  return twilioClient;
}

export function validateCanadianPhoneNumber(phoneNumber: string): boolean {
  // Canadian phone numbers: +1 followed by 10 digits
  // Format: +1XXXXXXXXXX or 1XXXXXXXXXX
  const cleaned = phoneNumber.replace(/\s|-|\(|\)/g, '');
  const canadianPattern = /^\+?1[2-9]\d{2}[2-9]\d{2}\d{4}$/;
  return canadianPattern.test(cleaned);
}

export function formatCanadianPhoneNumber(phoneNumber: string): string {
  // Ensure it starts with +1
  const cleaned = phoneNumber.replace(/\s|-|\(|\)/g, '');
  if (cleaned.startsWith('+1')) {
    return cleaned;
  }
  if (cleaned.startsWith('1')) {
    return `+${cleaned}`;
  }
  return `+1${cleaned}`;
}

