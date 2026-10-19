import {
  buildRelationInputs,
  COMPANY_CONTENT_TYPE,
  CUSTOMER_CONTENT_TYPE,
  getWidgetContacts,
} from '../utils';
import { useCreateMultipleRelations } from './useCreateMultipleRelations';

/**
 * Links a record of `relatedContentType` (just created or picked inside a
 * relation widget) to the host record and to every contact the host is about,
 * so it shows on the other records of those contacts too.
 */
export const useRelateRecord = ({
  contentType,
  contentId,
  relatedContentType,
  customerId,
  companyId,
  customerIds,
  companyIds,
}: {
  contentType: string;
  contentId: string;
  relatedContentType: string;
  customerId?: string;
  companyId?: string;
  customerIds?: string[];
  companyIds?: string[];
}) => {
  const { createMultipleRelations, loading } = useCreateMultipleRelations();

  const relateRecord = (relatedId: string) => {
    const contacts = getWidgetContacts({
      customerId,
      companyId,
      customerIds,
      companyIds,
    });

    return createMultipleRelations(
      buildRelationInputs({
        related: { contentType: relatedContentType, contentId: relatedId },
        sources: [
          { contentType, contentId },
          ...contacts.customerIds.map((id) => ({
            contentType: CUSTOMER_CONTENT_TYPE,
            contentId: id,
          })),
          ...contacts.companyIds.map((id) => ({
            contentType: COMPANY_CONTENT_TYPE,
            contentId: id,
          })),
        ],
      }),
    );
  };

  return { relateRecord, loading };
};
