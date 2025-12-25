'use client';

import { CallTranscript as TranscriptType } from '@/lib/types';
import { useEffect, useRef } from 'react';

interface CallTranscriptProps {
  transcripts: TranscriptType[];
  isActive: boolean;
}

export default function CallTranscript({ transcripts, isActive }: CallTranscriptProps) {
  const transcriptEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (transcriptEndRef.current) {
      transcriptEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [transcripts]);

  if (!isActive && transcripts.length === 0) {
    return (
      <div className="h-full flex items-center justify-center text-gray-400 dark:text-gray-600">
        <p>Call transcript will appear here...</p>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto p-4 space-y-3">
      {transcripts.map((transcript, index) => {
        const isBooking = transcript.role === 'booking';
        const isInProgress = transcript.bookingStatus === 'in_progress';
        const isSuccess = transcript.bookingStatus === 'success';
        const isFailed = transcript.bookingStatus === 'failed';

        return (
          <div
            key={index}
            className={`
              p-3 rounded-lg max-w-[85%] transition-all duration-300
              ${transcript.role === 'user' 
                ? 'ml-auto bg-blue-100 dark:bg-blue-900/30 text-blue-900 dark:text-blue-100' 
                : transcript.role === 'assistant'
                ? 'mr-auto bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100'
                : isBooking && isInProgress
                ? 'mx-auto bg-purple-100 dark:bg-purple-900/30 text-purple-900 dark:text-purple-100 border-2 border-purple-300 dark:border-purple-700 animate-pulse'
                : isBooking && isSuccess
                ? 'mx-auto bg-green-100 dark:bg-green-900/30 text-green-900 dark:text-green-100 border-2 border-green-300 dark:border-green-700'
                : isBooking && isFailed
                ? 'mx-auto bg-red-100 dark:bg-red-900/30 text-red-900 dark:text-red-100 border-2 border-red-300 dark:border-red-700'
                : 'mx-auto bg-yellow-100 dark:bg-yellow-900/30 text-yellow-900 dark:text-yellow-100 text-xs'
              }
            `}
          >
            <div className="flex items-start gap-2">
              {isBooking && isInProgress && (
                <svg className="animate-spin h-4 w-4 text-purple-600 dark:text-purple-400 mt-0.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              )}
              <span className="font-semibold text-xs uppercase opacity-70">
                {transcript.role === 'user' ? 'Customer' 
                  : transcript.role === 'assistant' ? 'AI' 
                  : isBooking ? 'Booking' 
                  : 'System'}
              </span>
              <span className="text-xs opacity-50">
                {transcript.timestamp.toLocaleTimeString()}
              </span>
            </div>
            <p className={`mt-1 ${isBooking ? 'text-sm font-medium' : 'text-sm'}`}>
              {transcript.content}
            </p>
            {isBooking && transcript.bookingData && (
              <div className="mt-2 pt-2 border-t border-current/20 text-xs opacity-80">
                {transcript.bookingData.customer_name && (
                  <p>👤 {transcript.bookingData.customer_name}</p>
                )}
                {transcript.bookingData.shop_name && (
                  <p>🏢 {transcript.bookingData.shop_name}</p>
                )}
                {transcript.bookingData.appointment_time && (
                  <p>📅 {new Date(transcript.bookingData.appointment_time).toLocaleString()}</p>
                )}
              </div>
            )}
          </div>
        );
      })}
      <div ref={transcriptEndRef} />
    </div>
  );
}

