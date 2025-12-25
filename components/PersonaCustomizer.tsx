'use client';

import { useState } from 'react';
import { PersonaCustomization } from '@/lib/types';
import { Settings, Save, X } from 'lucide-react';

interface PersonaCustomizerProps {
  personaId: string;
  currentCustomization: PersonaCustomization;
  onSave: (customization: PersonaCustomization) => void;
}

export default function PersonaCustomizer({
  personaId,
  currentCustomization,
  onSave,
}: PersonaCustomizerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState<PersonaCustomization>(currentCustomization);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    setIsOpen(false);
  };

  const handleReset = () => {
    setFormData(currentCustomization);
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
      >
        <Settings className="w-4 h-4" />
        Customize
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
            Customize Business Details
          </h3>
          <button
            onClick={() => {
              setIsOpen(false);
              handleReset();
            }}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label htmlFor="companyName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Company Name *
            </label>
            <input
              id="companyName"
              type="text"
              required
              value={formData.companyName}
              onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
              placeholder="e.g., Maple Leaf Barber Shop"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              The AI will use this name when speaking to customers
            </p>
          </div>

          <div>
            <label htmlFor="service" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Main Service/Description *
            </label>
            <textarea
              id="service"
              required
              value={formData.service}
              onChange={(e) => setFormData({ ...formData, service: e.target.value })}
              placeholder="e.g., Professional haircuts, beard trims, and styling services"
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Describe what your business offers - this will be incorporated into the AI's responses
            </p>
          </div>

          <div>
            <label htmlFor="address" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Business Address (Optional)
            </label>
            <input
              id="address"
              type="text"
              value={formData.address || ''}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="e.g., 123 Queen Street West, Toronto, ON M5H 2M9"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Canadian address format: Street, City, ON Postal Code
            </p>
          </div>

          <div>
            <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Phone Number (Optional)
            </label>
            <input
              id="phoneNumber"
              type="tel"
              value={formData.phoneNumber || ''}
              onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
              placeholder="e.g., +1 (416) 555-1234"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Canadian format: +1 (area code) XXX-XXXX
            </p>
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-300 mb-2">
              🇨🇦 Canadian Features Enabled
            </h4>
            <ul className="text-xs text-blue-800 dark:text-blue-400 space-y-1">
              <li>• Polite Canadian tone ("please", "thanks so much")</li>
              <li>• Toronto-specific references and Eastern Time</li>
              <li>• Canadian date format (day-month-year)</li>
              <li>• Proper Canadian address format</li>
              <li>• Friendly, accommodating language</li>
            </ul>
          </div>

          <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              type="submit"
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors"
            >
              <Save className="w-4 h-4" />
              Save & Update AI
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Reset
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

