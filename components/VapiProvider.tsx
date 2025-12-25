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

  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_VAPI_API_KEY;
    if (!apiKey) {
      console.error('NEXT_PUBLIC_VAPI_API_KEY is not set');
      return;
    }

    const client = new Vapi(apiKey);
    setVapi(client);

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

    const handleFunctionCall = (event: any) => {
      if (event?.functionCall?.name === 'confirm_booking' || event?.name === 'confirm_booking') {
        const params = event.functionCall?.parameters || event.parameters || {};
        setTranscripts((prev) => [
          ...prev,
          {
            role: 'system',
            content: `Booking confirmed: ${JSON.stringify(params)}`,
            timestamp: new Date(),
          },
        ]);
      }
    };

    const handleError = (error: any) => {
      console.error('Vapi SDK Error:', error);
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

    console.log('Starting call with Assistant ID:', assistantId);

    try {
      // Try different method names
      if (typeof vapi.start === 'function') {
        vapi.start(assistantId);
      } else if (typeof (vapi as any).call === 'function') {
        (vapi as any).call(assistantId);
      }
    } catch (err) {
      console.error('Failed to start call:', err);
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
      }}
    >
      {children}
    </VapiContext.Provider>
  );
}

