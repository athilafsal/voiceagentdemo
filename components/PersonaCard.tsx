'use client';

import { Persona } from '@/lib/types';
import { Check } from 'lucide-react';

interface PersonaCardProps {
  persona: Persona;
  isSelected: boolean;
  onSelect: (personaId: string) => void;
}

export default function PersonaCard({ persona, isSelected, onSelect }: PersonaCardProps) {
  return (
    <button
      onClick={() => onSelect(persona.id)}
      className={`
        relative w-full p-6 rounded-lg border-2 transition-all duration-200
        text-left hover:shadow-lg hover:scale-[1.02]
        ${isSelected 
          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-md' 
          : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-gray-300'
        }
      `}
    >
      {isSelected && (
        <div className="absolute top-4 right-4">
          <div className="bg-blue-500 rounded-full p-1">
            <Check className="w-4 h-4 text-white" />
          </div>
        </div>
      )}
      
      <div className="flex items-start gap-4">
        <div className={`${persona.color} w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold text-lg flex-shrink-0`}>
          {persona.displayName.charAt(0)}
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-1">
            {persona.displayName}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {persona.description}
          </p>
          <div className="mt-2 text-xs text-gray-500 dark:text-gray-500">
            Assistant: {persona.assistantName}
          </div>
        </div>
      </div>
    </button>
  );
}

