'use client';

import { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { personas, getPersonaById } from '@/lib/personas';
import { Persona, PersonaCustomization } from '@/lib/types';
import PersonaCard from '@/components/PersonaCard';
import PersonaCustomizer from '@/components/PersonaCustomizer';
import CallControls from '@/components/CallControls';
import CallTranscript from '@/components/CallTranscript';
import VapiProvider, { useVapi } from '@/components/VapiProvider';
import { LogOut, Loader2 } from 'lucide-react';

function DashboardContent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [selectedPersonaId, setSelectedPersonaId] = useState<string>(personas[0].id);
  const [customization, setCustomization] = useState<Record<string, PersonaCustomization>>({});
  const [isUpdatingAssistant, setIsUpdatingAssistant] = useState(false);
  const [updateError, setUpdateError] = useState('');
  const [isSettingUp, setIsSettingUp] = useState(false);
  const [setupMessage, setSetupMessage] = useState('');
  
  const { isCallActive, transcripts, startCall, endCall } = useVapi();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  const updateAssistantConfig = async (customizationData?: PersonaCustomization) => {
    if (!selectedPersonaId) return;

    setIsUpdatingAssistant(true);
    setUpdateError('');

    try {
      const customData = customizationData || customization[selectedPersonaId];
      const response = await fetch('/api/vapi/update-assistant', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          personaId: selectedPersonaId,
          customization: customData,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update assistant');
      }
    } catch (error) {
      setUpdateError(error instanceof Error ? error.message : 'Failed to update assistant');
    } finally {
      setIsUpdatingAssistant(false);
    }
  };

  useEffect(() => {
    // Update assistant when persona changes
    updateAssistantConfig();
  }, [selectedPersonaId]);

  const handleCustomizationSave = (customizationData: PersonaCustomization) => {
    setCustomization((prev) => ({
      ...prev,
      [selectedPersonaId]: customizationData,
    }));
    updateAssistantConfig(customizationData);
  };

  const getCurrentCustomization = (): PersonaCustomization => {
    const persona = getPersonaById(selectedPersonaId);
    return customization[selectedPersonaId] || {
      companyName: persona?.displayName || '',
      service: persona?.description || '',
    };
  };

  const handleSetupAssistant = async () => {
    setIsSettingUp(true);
    setSetupMessage('');
    setUpdateError('');

    try {
      const response = await fetch('/api/vapi/setup-assistant', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({}),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to setup assistant');
      }

      const result = await response.json();
      setSetupMessage(result.message);
      
      // If a new assistant was created, show the ID
      if (result.assistantId && !process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID) {
        setSetupMessage(`${result.message}\n\nAdd this to your .env.local:\nVAPI_ASSISTANT_ID=${result.assistantId}\nNEXT_PUBLIC_VAPI_ASSISTANT_ID=${result.assistantId}`);
      }
    } catch (error) {
      setUpdateError(error instanceof Error ? error.message : 'Failed to setup assistant');
    } finally {
      setIsSettingUp(false);
    }
  };

  const handleStartBrowserCall = () => {
    startCall();
  };

  const handleStartPhoneCall = async (phoneNumber: string) => {
    try {
      const response = await fetch('/api/vapi/create-call', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phoneNumber }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create call');
      }

      const result = await response.json();
      // Phone call initiated successfully
      // Note: Transcripts will come via webhook, not Web SDK
    } catch (error) {
      throw error;
    }
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (!session) {
    return null;
  }

  const selectedPersona = getPersonaById(selectedPersonaId);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                MapleVoice Demo
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                AI Voice Automation Platform
              </p>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {session.user?.email}
              </span>
              <button
                onClick={() => signOut({ callbackUrl: '/login' })}
                className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Persona Selection */}
        <section className="mb-8">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Select Business Persona
            </h2>
            <div className="flex gap-2">
              <button
                onClick={handleSetupAssistant}
                disabled={isSettingUp}
                className="flex items-center gap-2 px-4 py-2 text-sm text-white bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 rounded-lg font-semibold transition-colors"
              >
                {isSettingUp ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Setting up...
                  </>
                ) : (
                  'Setup Assistant'
                )}
              </button>
              <PersonaCustomizer
                personaId={selectedPersonaId}
                currentCustomization={getCurrentCustomization()}
                onSave={handleCustomizationSave}
              />
            </div>
          </div>
          {setupMessage && (
            <div className="mb-4 p-3 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg">
              <p className="text-sm text-purple-700 dark:text-purple-300 whitespace-pre-line">
                {setupMessage}
              </p>
            </div>
          )}
          {isUpdatingAssistant && (
            <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
              <span className="text-sm text-blue-700 dark:text-blue-300">
                Updating AI assistant configuration...
              </span>
            </div>
          )}
          {updateError && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <span className="text-sm text-red-700 dark:text-red-300">
                {updateError}
              </span>
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {personas.map((persona) => (
              <PersonaCard
                key={persona.id}
                persona={persona}
                isSelected={selectedPersonaId === persona.id}
                onSelect={setSelectedPersonaId}
              />
            ))}
          </div>
          {customization[selectedPersonaId] && (
            <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
              <p className="text-sm text-green-700 dark:text-green-300">
                <strong>Customized:</strong> {customization[selectedPersonaId].companyName} - {customization[selectedPersonaId].service}
              </p>
            </div>
          )}
        </section>

        {/* Call Interface */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Call Controls */}
          <section className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Call Controls
            </h2>
            {selectedPersona && (
              <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Active Persona: <span className="font-semibold text-gray-900 dark:text-white">{selectedPersona.displayName}</span>
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                  Assistant: {selectedPersona.assistantName}
                </p>
              </div>
            )}
            <CallControls
              onStartBrowserCall={handleStartBrowserCall}
              onStartPhoneCall={handleStartPhoneCall}
              isCallActive={isCallActive}
              onEndCall={endCall}
            />
          </section>

          {/* Call Transcript */}
          <section className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Live Transcript
            </h2>
            <div className="h-96 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
              <CallTranscript transcripts={transcripts} isActive={isCallActive} />
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

export default function DashboardPage() {
  const assistantId = process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID || '';

  if (!assistantId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 dark:text-red-400">
            NEXT_PUBLIC_VAPI_ASSISTANT_ID is not configured
          </p>
        </div>
      </div>
    );
  }

  return (
    <VapiProvider assistantId={assistantId}>
      <DashboardContent />
    </VapiProvider>
  );
}

