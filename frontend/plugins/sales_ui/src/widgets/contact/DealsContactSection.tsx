import { useQuery } from '@apollo/client';
import { IconSandbox } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import {
  ContactWidgetRow,
  ContactWidgetSection,
  IContactWidgetProps,
  useSidePanel,
} from 'ui-modules';
import { SALES_CONTACT_DEALS } from './contactDeals';

// The most deals listed for one contact.
const CONTACT_RECORDS_LIMIT = 50;

/**
 * A customer's or company's deals, found by the contact on the deals
 * themselves; "+" creates one for them (dealsAdd saves the contact on it).
 */
export const DealsContactSection = ({
  contentType,
  contentId,
}: Omit<IContactWidgetProps, 'module'>) => {
  const { t } = useTranslation('sales');
  const isCompany = contentType === 'core:company';
  const contacts = isCompany
    ? { companyId: contentId }
    : { customerId: contentId };
  const { data, loading } = useQuery(SALES_CONTACT_DEALS, {
    variables: {
      ...contacts,
      limit: CONTACT_RECORDS_LIMIT,
    },
  });
  const { openRecord, openNewRecord } = useSidePanel();
  const deals = (data?.deals?.list || []).flatMap((deal) =>
    deal ? [deal] : [],
  );
  const dealsById = new Map(deals.map((deal) => [deal._id, deal]));

  return (
    <ContactWidgetSection
      icon={IconSandbox}
      label={t('deals', 'Deals')}
      ids={[...dealsById.keys()]}
      loading={loading}
      createLabel={t('add-a-deal', 'Add a deal')}
      onCreate={() => openNewRecord('sales:deal', contacts, { stack: true })}
      renderItem={(dealId) => {
        const deal = dealsById.get(dealId);

        return (
          deal && (
            <ContactWidgetRow
              title={deal.name || t('untitled', 'Untitled')}
              meta={deal.stage?.name}
              onClick={() =>
                openRecord(
                  { contentType: 'sales:deal', contentId: deal._id },
                  { stack: true },
                )
              }
            />
          )
        );
      }}
    />
  );
};
