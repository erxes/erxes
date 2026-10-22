import {
  buildRelationInputs,
  COMPANY_CONTENT_TYPE,
  CUSTOMER_CONTENT_TYPE,
  getWidgetContacts,
} from '../utils';
import { useCreateMultipleRelations } from './useCreateMultipleRelations';

/**
 * Links a record of `relatedContentType` to the host record and to every
 * contact the host is about, so it shows on the other records of those
 * contacts too.
 *
 * - `relateRecord`: for a record picked in a relation widget.
 * - `contacts` + `relateToHost`: for one created there. Pass `contacts` to
 *   the create mutation (it links them on the server), then call
 *   `relateToHost` with the new id: it links the host only when the host is
 *   not itself a contact (a contact host is among `contacts`).
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
  const isContactHost =
    contentType === CUSTOMER_CONTENT_TYPE ||
    contentType === COMPANY_CONTENT_TYPE;
  const contacts = getWidgetContacts({
    customerId: contentType === CUSTOMER_CONTENT_TYPE ? contentId : customerId,
    companyId: contentType === COMPANY_CONTENT_TYPE ? contentId : companyId,
    customerIds,
    companyIds,
  });

  const relateToHost = (relatedId: string) =>
    isContactHost
      ? Promise.resolve(undefined)
      : createMultipleRelations(
          buildRelationInputs({
            related: { contentType: relatedContentType, contentId: relatedId },
            sources: [{ contentType, contentId }],
          }),
          { silent: true },
        );

  const relateRecord = (relatedId: string) => {
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

  // The host's contact as a new record's own (it keeps one of each).
  const ownContacts = {
    customerId: contacts.customerIds[0],
    companyId: contacts.companyIds[0],
  };

  return { relateRecord, relateToHost, contacts: ownContacts, loading };
};
