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
      {transcripts.map((transcript, index) => (
        <div
          key={index}
          className={`
            p-3 rounded-lg max-w-[85%]
            ${transcript.role === 'user' 
              ? 'ml-auto bg-blue-100 dark:bg-blue-900/30 text-blue-900 dark:text-blue-100' 
              : transcript.role === 'assistant'
              ? 'mr-auto bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100'
              : 'mx-auto bg-yellow-100 dark:bg-yellow-900/30 text-yellow-900 dark:text-yellow-100 text-xs'
            }
          `}
        >
          <div className="flex items-start gap-2">
            <span className="font-semibold text-xs uppercase opacity-70">
              {transcript.role === 'user' ? 'Customer' : transcript.role === 'assistant' ? 'AI' : 'System'}
            </span>
            <span className="text-xs opacity-50">
              {transcript.timestamp.toLocaleTimeString()}
            </span>
          </div>
          <p className="mt-1 text-sm">{transcript.content}</p>
        </div>
      ))}
      <div ref={transcriptEndRef} />
    </div>
  );
}

