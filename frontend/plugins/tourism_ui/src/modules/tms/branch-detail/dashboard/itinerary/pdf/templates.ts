import type { ItineraryPdfTemplate } from './types';

export interface ItineraryPdfTemplateOption {
  value: ItineraryPdfTemplate;
  label: string;
  description: string;
}

export const ITINERARY_PDF_TEMPLATES: ItineraryPdfTemplateOption[] = [
  {
    value: 'classic',
    label: 'Classic',
    description: 'Cover and standard pages.',
  },
  {
    value: 'editorial',
    label: 'Modern',
    description: 'Logo-led editorial pages.',
  },
  {
    value: 'custom',
    label: 'Custom Builder',
    description: 'User-designed PDF layout.',
  },
];
