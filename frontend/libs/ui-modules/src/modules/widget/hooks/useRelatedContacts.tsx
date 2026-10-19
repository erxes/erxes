import { useMemo } from 'react';
import {
  COMPANY_CONTENT_TYPE,
  CUSTOMER_CONTENT_TYPE,
  getWidgetContacts,
} from '../utils';
import { useRelations } from './useRelations';

/**
 * The customers and companies a record is linked to, the record itself
 * included when it is a contact. Contacts connect plugins: what any plugin
 * links to them shows on every record linked to the same contacts.
 */
export const useRelatedContacts = ({
  contentType,
  contentId,
  customerId,
  companyId,
  skip,
}: {
  contentType: string;
  contentId: string;
  customerId?: string;
  companyId?: string;
  skip?: boolean;
}) => {
  const isCustomer = contentType === CUSTOMER_CONTENT_TYPE;
  const isCompany = contentType === COMPANY_CONTENT_TYPE;

  const customers = useRelations({
    variables: {
      contentId,
      contentType,
      relatedContentType: CUSTOMER_CONTENT_TYPE,
    },
    skip: skip || isCustomer,
  });

  const companies = useRelations({
    variables: {
      contentId,
      contentType,
      relatedContentType: COMPANY_CONTENT_TYPE,
    },
    skip: skip || isCompany,
  });

  const contacts = useMemo(
    () =>
      getWidgetContacts({
        customerId: isCustomer ? contentId : customerId,
        companyId: isCompany ? contentId : companyId,
        customerIds: customers.relatedIds,
        companyIds: companies.relatedIds,
      }),
    [
      isCustomer,
      isCompany,
      contentId,
      customerId,
      companyId,
      customers.relatedIds,
      companies.relatedIds,
    ],
  );

  return {
    ...contacts,
    loading: customers.loading || companies.loading,
  };
};
