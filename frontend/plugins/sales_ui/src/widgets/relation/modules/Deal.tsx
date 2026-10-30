import { useQuery } from '@apollo/client';
import { Button, Spinner } from 'erxes-ui';
import { IconCaretLeftRight, IconPlus } from '@tabler/icons-react';
import {
  getHostContacts,
  IRelationWidgetProps,
  RelationWidgetEmptyState,
  RelationWidgetList,
  useSidePanel,
} from 'ui-modules';

import { DealWidget } from './DealWidget';
import { SALES_CONTACT_DEALS } from '~/widgets/contact/contactDeals';
import { useTranslation } from 'react-i18next';

// The most deals listed for one customer or company.
const CONTACT_RECORDS_LIMIT = 50;

/**
 * The deals of the host's customer and company, found by the contact on the
 * deals themselves; "+" creates one for them (dealsAdd saves the contact).
 */
export const Deal = ({
  contentId,
  contentType,
  customerId,
  companyId,
  customerIds,
  companyIds,
}: Omit<IRelationWidgetProps, 'module' | 'pluginName'>) => {
  const { t } = useTranslation('sales');
  const contacts = getHostContacts({
    contentType,
    contentId,
    customerId,
    companyId,
    customerIds,
    companyIds,
  });
  const customerDeals = useQuery(SALES_CONTACT_DEALS, {
    variables: {
      customerId: contacts.customerId,
      limit: CONTACT_RECORDS_LIMIT,
    },
    skip: !contacts.customerId,
  });
  const companyDeals = useQuery(SALES_CONTACT_DEALS, {
    variables: {
      companyId: contacts.companyId,
      limit: CONTACT_RECORDS_LIMIT,
    },
    skip: !contacts.companyId,
  });
  const { openNewRecord } = useSidePanel();

  if (customerDeals.loading || companyDeals.loading) {
    return <Spinner containerClassName="py-20" />;
  }

  // The host itself is not listed among its contacts' deals.
  const dealIds = [
    ...new Set(
      [
        ...(customerDeals.data?.deals?.list || []),
        ...(companyDeals.data?.deals?.list || []),
      ].flatMap((deal) => (deal && deal._id !== contentId ? [deal._id] : [])),
    ),
  ];

  const handleDealOpen = () => {
    openNewRecord('sales:deal', contacts);
  };

  if (dealIds.length === 0) {
    return (
      <RelationWidgetEmptyState
        icon={IconCaretLeftRight}
        message={t('no-deals-to-display')}
      >
        <Button variant="secondary" onClick={handleDealOpen}>
          <IconPlus />
          {t('add-a-deal')}
        </Button>
      </RelationWidgetEmptyState>
    );
  }

  return (
    <RelationWidgetList
      label={t('deals')}
      actions={
        <Button variant="secondary" onClick={handleDealOpen}>
          <IconPlus />
        </Button>
      }
    >
      {dealIds.map((dealId) => (
        <DealWidget key={dealId} dealId={dealId} />
      ))}
    </RelationWidgetList>
  );
};
