'use client';

import { useState } from 'react';
import { Phone, PhoneOff, Loader2 } from 'lucide-react';

interface CallControlsProps {
  onStartBrowserCall: () => void;
  onStartPhoneCall: (phoneNumber: string) => Promise<void>;
  isCallActive: boolean;
  onEndCall: () => void;
}

export default function CallControls({
  onStartBrowserCall,
  onStartPhoneCall,
  isCallActive,
  onEndCall,
}: CallControlsProps) {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handlePhoneCall = async () => {
    if (!phoneNumber.trim()) {
      setError('Please enter a phone number');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      await onStartPhoneCall(phoneNumber);
      setPhoneNumber('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start call');
    } finally {
      setIsLoading(false);
    }
  };

  if (isCallActive) {
    return (
      <div className="flex flex-col items-center gap-4">
        <button
          onClick={onEndCall}
          className="flex items-center gap-2 px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg font-semibold transition-colors"
        >
          <PhoneOff className="w-5 h-5" />
          End Call
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <button
        onClick={onStartBrowserCall}
        className="flex items-center justify-center gap-2 px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg font-semibold transition-colors w-full"
      >
        <Phone className="w-5 h-5" />
        Start Browser Call
      </button>

      <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
          Or start a phone call:
        </p>
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="tel"
            value={phoneNumber}
            onChange={(e) => {
              setPhoneNumber(e.target.value);
              setError('');
            }}
            placeholder="+1 (555) 123-4567"
            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handlePhoneCall}
            disabled={isLoading}
            className="flex items-center justify-center gap-2 px-6 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white rounded-lg font-semibold transition-colors"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Calling...
              </>
            ) : (
              <>
                <Phone className="w-4 h-4" />
                Call
              </>
            )}
          </button>
        </div>
        {error && (
          <p className="mt-2 text-sm text-red-600 dark:text-red-400">{error}</p>
        )}
      </div>
    </div>
  );
}

