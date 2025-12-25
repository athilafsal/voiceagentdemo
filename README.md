# MapleVoice AI Agent Demo Orchestrator

A multi-tenant demo platform for selling AI Voice Automation to Canadian SMBs. This application allows salespeople to toggle between business personas (Modern Barber, Family Dental, Elite Plumbing) and trigger live Vapi-powered AI voice calls that integrate with Make.com for real-time calendar booking.

## Features

- **Persona Switcher**: Switch between different business niches with instant AI assistant configuration
- **Browser & Phone Calls**: Support for both browser-based calls (via Vapi Web SDK) and real phone calls (via Twilio)
- **Real-time Transcripts**: Live call transcripts displayed in real-time
- **Function Calling**: AI can trigger `confirm_booking` function that sends data to Make.com webhook
- **Multi-tenant Authentication**: Secure login system for salespeople
- **Mobile Responsive**: Works seamlessly on mobile devices for in-person demos

## Tech Stack

- **Framework**: Next.js 14+ (App Router) with TypeScript
- **Voice Engine**: Vapi AI (via Vapi SDK/API)
- **Telephony**: Twilio (for Canadian +1 numbers)
- **Automation**: Make.com (Webhook endpoint for booking logic)
- **Styling**: Tailwind CSS
- **Authentication**: NextAuth.js

## Prerequisites

- Node.js 18+ and npm
- Vapi.ai account with API key and assistant ID
- Twilio account (for phone calls)
- Make.com account (for webhook automation)

## Setup Instructions

### 1. Clone and Install

```bash
npm install
```

### 2. Environment Variables

Copy `.env.local.example` to `.env.local` and fill in your credentials:

```bash
cp .env.local.example .env.local
```

Required environment variables:

```env
# Vapi Configuration
VAPI_API_KEY=your_vapi_api_key_here
VAPI_ASSISTANT_ID=your_vapi_assistant_id_here
VAPI_PHONE_NUMBER_ID=your_vapi_phone_number_id_here  # Optional

# Public Vapi Key (for Web SDK - must be public key)
NEXT_PUBLIC_VAPI_API_KEY=your_vapi_public_key_here
NEXT_PUBLIC_VAPI_ASSISTANT_ID=your_vapi_assistant_id_here

# Twilio Configuration
TWILIO_ACCOUNT_SID=your_twilio_account_sid_here
TWILIO_AUTH_TOKEN=your_twilio_auth_token_here
TWILIO_PHONE_NUMBER=+15551234567

# Make.com Webhook
MAKE_COM_WEBHOOK_URL=https://hook.make.com/your_webhook_url_here

# NextAuth Configuration
NEXTAUTH_SECRET=your_nextauth_secret_here
NEXTAUTH_URL=http://localhost:3000
```

**Generate NEXTAUTH_SECRET:**
```bash
openssl rand -base64 32
```

### 3. Setup Vapi Assistant (Automatic!)

The assistant is configured programmatically - no dashboard setup needed!

**Option 1: Using the UI**
1. Start the dev server: `npm run dev`
2. Login to the dashboard
3. Click "Setup Assistant" button
4. Copy the Assistant ID if a new one was created

**Option 2: Using Command Line**
```bash
npm run setup-vapi
```

This will:
- Create/update your assistant with Canadian prompts
- Add the `confirm_booking` function automatically
- Configure webhook URLs
- No manual configuration needed!

### 4. Configure Make.com Webhook

Set up a Make.com scenario that:
1. Receives webhook with booking data
2. Creates a Google Calendar event
3. Sends confirmation SMS via Twilio

### 5. Run the Application

```bash
npm run dev
```

Visit `http://localhost:3000` and sign in with any email/password (demo mode).

## Usage

1. **Login**: Use any email and password to sign in (demo mode)
2. **Select Persona**: Click on one of the three business persona cards
   - Modern Barber
   - Family Dental
   - Elite Plumbing
3. **Start Browser Call**: Click "Start Browser Call" to initiate a browser-based call
4. **Start Phone Call**: Enter a Canadian phone number and click "Call" to trigger an outbound call
5. **View Transcripts**: Watch real-time call transcripts appear in the transcript panel
6. **Booking**: When the AI triggers `confirm_booking`, the data is sent to Make.com

## Project Structure

```
callingagent/
├── app/
│   ├── api/
│   │   ├── auth/[...nextauth]/route.ts    # NextAuth endpoints
│   │   ├── vapi/
│   │   │   ├── update-assistant/route.ts  # Update Vapi assistant config
│   │   │   └── create-call/route.ts       # Create outbound call
│   │   └── webhook/make/route.ts          # Make.com webhook receiver
│   ├── dashboard/page.tsx                 # Main demo dashboard
│   ├── login/page.tsx                     # Login page
│   └── layout.tsx                         # Root layout
├── components/
│   ├── PersonaCard.tsx                    # Persona selector card
│   ├── CallControls.tsx                  # Call control buttons
│   ├── CallTranscript.tsx                 # Transcript display
│   ├── VapiProvider.tsx                  # Vapi Web SDK wrapper
│   └── SessionProvider.tsx               # NextAuth session provider
├── lib/
│   ├── vapi.ts                           # Vapi API client
│   ├── twilio.ts                         # Twilio client
│   ├── auth.ts                           # NextAuth configuration
│   ├── personas.ts                       # Persona configurations
│   └── types.ts                          # TypeScript types
└── middleware.ts                         # Route protection
```

## API Endpoints

### `PATCH /api/vapi/update-assistant`
Updates the Vapi assistant configuration based on selected persona.

**Body:**
```json
{
  "personaId": "modern-barber"
}
```

### `POST /api/vapi/create-call`
Creates an outbound phone call via Twilio.

**Body:**
```json
{
  "phoneNumber": "+15551234567"
}
```

### `POST /api/webhook/make`
Receives booking data from Vapi function calls and forwards to Make.com.

**Body:**
```json
{
  "customer_name": "John Doe",
  "appointment_time": "2024-01-15T10:00:00Z",
  "shop_name": "Modern Barber"
}
```

## Development

```bash
# Development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Lint
npm run lint
```

## Notes

- Browser calls use the Vapi Web SDK and work immediately for testing
- Phone calls require Twilio configuration and a Canadian phone number
- The `confirm_booking` function must be configured in your Vapi assistant dashboard
- Make.com webhook URL should point to your Make.com scenario webhook

## License

Private - Internal use only
