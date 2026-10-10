import { useState } from 'react';
import { useRelations } from 'ui-modules';

const CUSTOMER_TYPE = 'core:customer';
export const RECORD_TAB = 'record';

/**
 * The tabs of a record that is not an owner: the points it moved, then the
 * loyalty of each customer linked to it (core relations, not the record's
 * own plugin).
 */
export const useRecordLoyaltyTabs = ({
  contentType,
  contentId,
  customerId,
}: {
  contentType: string;
  contentId: string;
  customerId?: string;
}) => {
  const [tab, setTab] = useState(RECORD_TAB);
  const { ownEntities } = useRelations({
    variables: {
      contentId,
      contentType,
      relatedContentType: CUSTOMER_TYPE,
    },
    skip: !contentId,
  });

  const customerIds = [
    ...new Set([
      ...(customerId ? [customerId] : []),
      ...ownEntities
        .filter((entity) => entity.contentType === CUSTOMER_TYPE)
        .map((entity) => entity.contentId),
    ]),
  ];

  return {
    tab: tab === RECORD_TAB || customerIds.includes(tab) ? tab : RECORD_TAB,
    setTab,
    customerIds,
  };
};
