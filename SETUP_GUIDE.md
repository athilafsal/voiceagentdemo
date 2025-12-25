# MapleVoice Setup Guide

Follow these steps to get your demo platform fully operational:

## Step 1: Get Your Vapi Credentials

1. **Sign up/Login to Vapi**: Go to https://dashboard.vapi.ai
2. **Get Your API Keys**:
   - Go to Settings → API Keys
   - Copy your **Public Key** (for Web SDK - starts with `pk_`)
   - Copy your **Private Key** (for server-side API calls - starts with `sk_`)

**Note**: You don't need to create an assistant manually - the code will do it for you!

## Step 2: Configure Your Vapi Assistant Programmatically

The assistant will be configured automatically via code. You have two options:

### Option A: Create a New Assistant (Recommended)

1. Add only your API keys to `.env.local`:
   ```env
   VAPI_API_KEY=sk_your_private_key_here
   NEXT_PUBLIC_VAPI_API_KEY=pk_your_public_key_here
   ```

2. Run the setup script:
   ```bash
   npm run setup-vapi
   ```

3. The script will create a new assistant and output the Assistant ID. Add it to `.env.local`:
   ```env
   VAPI_ASSISTANT_ID=the_assistant_id_from_output
   NEXT_PUBLIC_VAPI_ASSISTANT_ID=the_assistant_id_from_output
   ```

### Option B: Use an Existing Assistant

If you already have an Assistant ID:

1. Add to `.env.local`:
   ```env
   VAPI_API_KEY=sk_your_private_key_here
   VAPI_ASSISTANT_ID=your_existing_assistant_id
   NEXT_PUBLIC_VAPI_API_KEY=pk_your_public_key_here
   NEXT_PUBLIC_VAPI_ASSISTANT_ID=your_existing_assistant_id
   ```

2. Run the setup script to configure it:
   ```bash
   npm run setup-vapi
   ```

**What the setup does:**
- Creates/updates the assistant with Canadian prompts
- Adds the `confirm_booking` function automatically
- Configures the webhook URL (from `MAKE_COM_WEBHOOK_URL` or your app URL)
- No manual dashboard configuration needed!

## Step 3: Get Your Twilio Credentials (Optional - for Phone Calls)

1. **Sign up/Login**: Go to https://console.twilio.com
2. **Get Credentials**:
   - Account SID (found on dashboard)
   - Auth Token (found on dashboard - click to reveal)
3. **Get a Canadian Phone Number**:
   - Go to Phone Numbers → Buy a Number
   - Select Canada (+1) as country
   - Purchase a number (you'll need this for outbound calls)

## Step 4: Set Up Make.com Webhook (Optional - for Booking Automation)

1. **Sign up/Login**: Go to https://www.make.com
2. **Create a Scenario**:
   - Add "Webhooks" → "Custom webhook" as trigger
   - Copy the webhook URL
   - Add modules to:
     - Create Google Calendar event
     - Send SMS via Twilio
3. **Copy the webhook URL** - you'll add it to `.env.local`

## Step 5: Update Environment Variables

1. **Open `.env.local`** in your project root
2. **Replace placeholder values** with your real credentials:

```env
# NextAuth (already configured)
NEXTAUTH_SECRET=VoQuCqXyzBcSaweWN2OTiv6h5bELpAsF
NEXTAUTH_URL=http://localhost:3000

# Vapi Configuration - REPLACE THESE
VAPI_API_KEY=sk_your_private_api_key_here
VAPI_ASSISTANT_ID=your_assistant_id_here
NEXT_PUBLIC_VAPI_API_KEY=pk_your_public_api_key_here
NEXT_PUBLIC_VAPI_ASSISTANT_ID=your_assistant_id_here

# Twilio Configuration - REPLACE THESE (optional)
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_PHONE_NUMBER=+14165551234

# Make.com Webhook - REPLACE THIS (optional)
MAKE_COM_WEBHOOK_URL=https://hook.make.com/your_webhook_id_here
```

## Step 6: Restart the Development Server

After updating `.env.local`:

1. **Stop the server** (Ctrl+C in terminal)
2. **Restart it**:
   ```bash
   npm run dev
   ```

**Important**: Environment variables are only loaded when the server starts, so you must restart after changing them.

## Step 7: Test the Application

1. **Open**: http://localhost:3000
2. **Login**: Use any email and password (demo mode)
3. **Select a Persona**: Click on Modern Barber, Family Dental, or Elite Plumbing
4. **Customize** (Optional): Click "Customize" button to add:
   - Your company name
   - Service description
   - Address and phone number
5. **Test Browser Call**: Click "Start Browser Call" to test the Web SDK
6. **Test Phone Call** (if Twilio configured): Enter a Canadian phone number and click "Call"

## Troubleshooting

### "NEXT_PUBLIC_VAPI_ASSISTANT_ID is not configured"
- Make sure you've added `NEXT_PUBLIC_VAPI_ASSISTANT_ID` to `.env.local`
- Restart the dev server after adding it

### "VAPI_API_KEY is not set" error
- Check that `VAPI_API_KEY` is in `.env.local` (not `.env`)
- Make sure you're using the **private key** (starts with `sk_`)
- Restart the server

### Browser call doesn't start
- Verify `NEXT_PUBLIC_VAPI_API_KEY` is set (use **public key** - starts with `pk_`)
- Check browser console for errors
- Make sure your Vapi assistant is properly configured

### Phone calls fail
- Verify Twilio credentials are correct
- Make sure you have a Canadian phone number in Twilio
- Check that phone number format is correct (+1XXXXXXXXXX)

### Function calling doesn't work
- Verify the `confirm_booking` function is configured in Vapi dashboard
- Check that the webhook URL is correct
- Test the webhook URL directly with a POST request

## Quick Start (Minimal Setup)

If you just want to test the UI and browser calls:

1. Get Vapi credentials (Step 1)
2. Add only these to `.env.local`:
   ```env
   VAPI_API_KEY=sk_your_key
   VAPI_ASSISTANT_ID=your_id
   NEXT_PUBLIC_VAPI_API_KEY=pk_your_key
   NEXT_PUBLIC_VAPI_ASSISTANT_ID=your_id
   ```
3. Restart server
4. Test browser calls (phone calls and Make.com are optional)

## Need Help?

- Vapi Docs: https://docs.vapi.ai
- Twilio Docs: https://www.twilio.com/docs
- Make.com Docs: https://www.make.com/en/help

