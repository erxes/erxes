import { useMutation } from '@apollo/client';
import { UPSERT_ITINERARY_PDF_TEMPLATE } from '../graphql/mutation';
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

interface UpsertItineraryPdfTemplateResponse {
  bmsItineraryPdfTemplateUpsert: ItineraryPdfTemplateRecord;
}

interface UpsertItineraryPdfTemplateInput {
  itineraryId: string;
  branchId?: string;
  kind?: string;
  name?: string;
  description?: string;
  status?: string;
  version?: number;
  doc: PdfTemplateDocument;
}

export const useUpsertItineraryPdfTemplate = () => {
  const [upsertMutation, { loading, error }] = useMutation<
    UpsertItineraryPdfTemplateResponse,
    { input: UpsertItineraryPdfTemplateInput }
  >(UPSERT_ITINERARY_PDF_TEMPLATE, {
    refetchQueries: ['BmsItineraryPdfTemplateDetail'],
    awaitRefetchQueries: true,
  });

  const upsertItineraryPdfTemplate = (options: {
    variables: { input: UpsertItineraryPdfTemplateInput };
    onCompleted?: (data: UpsertItineraryPdfTemplateResponse) => void;
    onError?: (error: unknown) => void;
  }) => upsertMutation(options);

  return {
    upsertItineraryPdfTemplate,
    loading,
    error,
  };
};
