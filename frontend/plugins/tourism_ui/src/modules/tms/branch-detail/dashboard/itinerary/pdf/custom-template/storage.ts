import { pdfTemplateDocumentSchema } from './template.schema';
import type { PdfTemplateDocument } from './template.types';

const STORAGE_PREFIX = 'tourism-ui:itinerary-custom-pdf-template';

export const getCustomTemplateStorageKey = (itineraryId?: string) =>
  `${STORAGE_PREFIX}:${itineraryId || 'draft'}`;

export const loadStoredCustomTemplate = (
  itineraryId?: string,
): PdfTemplateDocument | null => {
  if (typeof window === 'undefined') return null;

  const raw = window.localStorage.getItem(
    getCustomTemplateStorageKey(itineraryId),
  );
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw);
    const result = pdfTemplateDocumentSchema.safeParse(parsed);
    return result.success ? result.data : null;
  } catch {
    return null;
  }
};

export const saveStoredCustomTemplate = (
  itineraryId: string | undefined,
  template: PdfTemplateDocument,
) => {
  if (typeof window === 'undefined') return;

  window.localStorage.setItem(
    getCustomTemplateStorageKey(itineraryId),
    JSON.stringify(template),
  );
};
