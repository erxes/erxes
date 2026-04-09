import { useMemo } from 'react';
import { useQuery } from '@apollo/client';
import { GET_ITINERARY_PDF_TEMPLATE } from '../graphql/queries';
import { pdfTemplateDocumentSchema } from '../pdf/custom-template';
import type { PdfTemplateDocument } from '../pdf/custom-template/template.types';

interface ItineraryPdfTemplateRecord {
  _id: string;
  itineraryId: string;
  branchId?: string;
  kind?: string;
  name?: string;
  description?: string;
  status?: string;
  version?: number;
  doc?: unknown;
  createdAt?: string;
  modifiedAt?: string;
  createdBy?: string;
  modifiedBy?: string;
}

interface ItineraryPdfTemplateResponse {
  bmsItineraryPdfTemplateDetail?: ItineraryPdfTemplateRecord | null;
}

interface ItineraryPdfTemplateVariables {
  itineraryId?: string;
  kind?: string;
}

export const useItineraryPdfTemplate = (
  itineraryId?: string,
  enabled = true,
  kind = 'custom-builder',
) => {
  const { data, loading, error, refetch } =
    useQuery<ItineraryPdfTemplateResponse>(GET_ITINERARY_PDF_TEMPLATE, {
      variables: { itineraryId, kind } as ItineraryPdfTemplateVariables,
      skip: !itineraryId || !enabled,
      fetchPolicy: 'cache-and-network',
    });

  const template = useMemo<PdfTemplateDocument | null>(() => {
    const doc = data?.bmsItineraryPdfTemplateDetail?.doc;
    if (!doc) {
      return null;
    }

    const result = pdfTemplateDocumentSchema.safeParse(doc);
    return result.success ? result.data : null;
  }, [data?.bmsItineraryPdfTemplateDetail?.doc]);

  return {
    template,
    templateRecord: data?.bmsItineraryPdfTemplateDetail || null,
    loading,
    error,
    refetch,
  };
};
