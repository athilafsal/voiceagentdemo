'use client';

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { CallTranscript } from '@/lib/types';
import Vapi from '@vapi-ai/web';

interface VapiContextType {
  isCallActive: boolean;
  transcripts: CallTranscript[];
  startCall: () => void;
  endCall: () => void;
  mute: () => void;
  unmute: () => void;
  isMuted: boolean;
  bookingInProgress: boolean;
}

const VapiContext = createContext<VapiContextType | undefined>(undefined);

export function useVapi() {
  const context = useContext(VapiContext);
  if (!context) {
    throw new Error('useVapi must be used within VapiProvider');
  }
  return context;
}

interface VapiProviderProps {
  children: ReactNode;
  assistantId: string;
}

export default function VapiProvider({ children, assistantId }: VapiProviderProps) {
  const [vapi, setVapi] = useState<any>(null);
  const [isCallActive, setIsCallActive] = useState(false);
  const [transcripts, setTranscripts] = useState<CallTranscript[]>([]);
  const [isMuted, setIsMuted] = useState(false);
  const [bookingInProgress, setBookingInProgress] = useState(false);

  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_VAPI_API_KEY;
    if (!apiKey) {
      console.error('NEXT_PUBLIC_VAPI_API_KEY is not set');
      return;
    }

    // Note: API key format may vary - Vapi supports different key formats
    // The key format check is informational only

    let client: any = null;
    try {
      client = new Vapi(apiKey);
      setVapi(client);
    } catch (error) {
      console.error('Failed to initialize Vapi client:', error);
      return; // Exit early if client creation fails
    }

    if (!client) {
      console.error('Vapi client is null');
      return;
    }

    // Set up event listeners - using any for event names to handle SDK variations
    const handleCallStart = () => {
      setIsCallActive(true);
      setTranscripts([]);
    };

    const handleCallEnd = () => {
      setIsCallActive(false);
    };

    const handleTranscript = (event: any) => {
      if (event?.transcript || event?.text) {
        setTranscripts((prev) => [
          ...prev,
          {
            role: event.role || 'assistant',
            content: event.transcript || event.text || '',
            timestamp: new Date(),
          },
        ]);
      }
    };

    const handleFunctionCall = async (event: any) => {
      if (event?.functionCall?.name === 'confirm_booking' || event?.name === 'confirm_booking') {
        const params = event.functionCall?.parameters || event.parameters || {};
        const bookingData = {
          customer_name: params.customer_name || params.customerName,
          appointment_time: params.appointment_time || params.appointmentTime,
          shop_name: params.shop_name || params.shopName,
        };

        // Show booking in progress
        setBookingInProgress(true);
        setTranscripts((prev) => [
          ...prev,
          {
            role: 'booking',
            content: '📅 Processing your appointment booking...',
            timestamp: new Date(),
            bookingStatus: 'in_progress',
            bookingData,
          },
        ]);

        // Try to call the webhook to verify booking
        try {
          const webhookUrl = `${window.location.origin}/api/webhook/make`;

          const response = await fetch(webhookUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(bookingData),
          });

          const result = await response.json();

          if (response.ok && result.success) {
            // Booking successful
            setTranscripts((prev) => [
              ...prev,
              {
                role: 'booking',
                content: `✅ Appointment confirmed! ${bookingData.customer_name} - ${bookingData.shop_name} on ${new Date(bookingData.appointment_time || '').toLocaleString()}`,
                timestamp: new Date(),
                bookingStatus: 'success',
                bookingData,
              },
            ]);
          } else {
            // Booking failed
            setTranscripts((prev) => [
              ...prev,
              {
                role: 'booking',
                content: `❌ Booking failed: ${result.error || 'Unknown error'}. Please try again.`,
                timestamp: new Date(),
                bookingStatus: 'failed',
                bookingData,
              },
            ]);
          }
        } catch (error) {
          // Error calling webhook
          console.error('Booking webhook error:', error);
          setTranscripts((prev) => [
            ...prev,
            {
              role: 'booking',
              content: `⚠️ Booking request received but confirmation pending. Details: ${bookingData.customer_name} - ${bookingData.shop_name}`,
              timestamp: new Date(),
              bookingStatus: 'in_progress',
              bookingData,
            },
          ]);
        } finally {
          setBookingInProgress(false);
        }
      }
    };

    const handleError = (error: any) => {
      console.error('Vapi SDK Error:', error);
      // Log detailed error information
      if (error?.error) {
        console.error('Error details:', error.error);
        if (error.error.message) {
          console.error('Error message:', error.error.message);
        }
        if (error.error.response) {
          console.error('Error response:', error.error.response);
        }
      }
      // Show user-friendly error message
      if (error?.type === 'start-method-error') {
        const errorMsg = error?.error?.message || 'Unknown error';
        if (errorMsg.includes('tool') && errorMsg.includes('does not exist')) {
          alert('Error: The assistant is configured with a tool that doesn\'t exist.\n\nPlease run "Setup Assistant" button to reconfigure the assistant without the invalid tool.');
        } else {
          alert(`Failed to start call: ${errorMsg}\n\nPlease check:\n1. Your API key is correct\n2. Your Assistant ID is valid\n3. Your Vapi account is active`);
        }
      }
    };

    // Use type assertion to handle event name variations
    const on = (client.on?.bind(client) as any) || ((event: string, handler: any) => {
      (client as any).addEventListener?.(event, handler);
    });
    const off = (client.off?.bind(client) as any) || ((event: string, handler: any) => {
      (client as any).removeEventListener?.(event, handler);
    });

    on('call-start', handleCallStart);
    on('call-end', handleCallEnd);
    // Try multiple possible event names - using type assertion for strict types
    on('transcript' as any, handleTranscript);
    on('message' as any, handleTranscript);
    on('function-call' as any, handleFunctionCall);
    on('tool-calls' as any, handleFunctionCall);
    on('error' as any, handleError);

    return () => {
      off('call-start', handleCallStart);
      off('call-end', handleCallEnd);
      off('transcript' as any, handleTranscript);
      off('message' as any, handleTranscript);
      off('function-call' as any, handleFunctionCall);
      off('tool-calls' as any, handleFunctionCall);
      off('error' as any, handleError);
    };
  }, [assistantId]);

  const startCall = useCallback(() => {
    if (!vapi) {
      console.error('Vapi client not initialized');
      return;
    }

    if (!assistantId) {
      console.error('Assistant ID is missing');
      alert('Assistant ID is missing. Please check your configuration.');
      return;
    }

    const apiKey = process.env.NEXT_PUBLIC_VAPI_API_KEY;
    if (!apiKey) {
      console.error('NEXT_PUBLIC_VAPI_API_KEY is not set');
      alert('Vapi API key is not configured. Please check your .env.local file.');
      return;
    }

    // Check if API key format is correct (should start with pk_)
    if (!apiKey.startsWith('pk_')) {
      console.warn('API key format may be incorrect. Vapi public keys should start with "pk_"');
    }

    console.log('Starting call with Assistant ID:', assistantId);
    console.log('Using API Key:', apiKey.substring(0, 10) + '...');

    try {
      // For Vapi SDK v2.5.2, try different method signatures
      // First try: start with assistantId as string (most common)
      if (typeof vapi.start === 'function') {
        try {
          vapi.start(assistantId);
          return; // Success, exit early
        } catch (e) {
          console.log('start(assistantId) failed, trying object format...', e);
        }
      }
      
      // Second try: start with object containing assistantId
      if (typeof vapi.start === 'function') {
        try {
          vapi.start({ assistantId });
          return;
        } catch (e) {
          console.log('start({assistantId}) failed, trying other methods...', e);
        }
      }
      
      // Third try: startCall method
      if (typeof (vapi as any).startCall === 'function') {
        try {
          (vapi as any).startCall(assistantId);
          return;
        } catch (e) {
          console.log('startCall failed, trying call method...', e);
        }
      }
      
      // Fourth try: call method
      if (typeof (vapi as any).call === 'function') {
        (vapi as any).call(assistantId);
        return;
      }
      
      // If all methods fail, throw error
      throw new Error('No valid Vapi start method found. Check SDK version and documentation.');
    } catch (err) {
      console.error('Failed to start call:', err);
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      console.error('Full error details:', err);
      alert(`Failed to start call: ${errorMessage}\n\nCheck console for details.`);
    }
  }, [vapi, assistantId]);

  const endCall = useCallback(() => {
    if (!vapi) {
      return;
    }

    // Try different method names
    if (typeof vapi.stop === 'function') {
      vapi.stop();
    } else if (typeof (vapi as any).end === 'function') {
      (vapi as any).end();
    } else if (typeof (vapi as any).hangup === 'function') {
      (vapi as any).hangup();
    }
    setIsCallActive(false);
  }, [vapi]);

  const mute = useCallback(() => {
    if (!vapi) {
      return;
    }

    // Try different method names
    if (typeof vapi.mute === 'function') {
      vapi.mute();
    } else if (typeof (vapi as any).setMuted === 'function') {
      (vapi as any).setMuted(true);
    }
    setIsMuted(true);
  }, [vapi]);

  const unmute = useCallback(() => {
    if (!vapi) {
      return;
    }

    // Try different method names
    if (typeof vapi.unmute === 'function') {
      vapi.unmute();
    } else if (typeof (vapi as any).setMuted === 'function') {
      (vapi as any).setMuted(false);
    }
    setIsMuted(false);
  }, [vapi]);

  return (
    <VapiContext.Provider
      value={{
        isCallActive,
        transcripts,
        startCall,
        endCall,
        mute,
        unmute,
        isMuted,
        bookingInProgress,
      }}
    >
      {children}
    </VapiContext.Provider>
  );
}

