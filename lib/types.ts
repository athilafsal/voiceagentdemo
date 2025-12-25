export interface Persona {
  id: string;
  name: string;
  displayName: string;
  systemPrompt: string;
  assistantName: string;
  description: string;
  color: string;
}

export interface PersonaCustomization {
  companyName: string;
  service: string;
  address?: string;
  phoneNumber?: string;
}

export interface CallTranscript {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
}

export interface BookingData {
  customer_name: string;
  appointment_time: string;
  shop_name: string;
}

export interface VapiCall {
  id: string;
  status: string;
  phoneNumber?: string;
}

