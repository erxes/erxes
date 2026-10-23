import { AddDealSheet } from '@/deals/components/AddDealSheet';
import { dealCreateSheetState } from '@/deals/states/dealCreateSheetState';
import { useQuery } from '@apollo/client';
import { IconSandbox } from '@tabler/icons-react';
import { useSetAtom } from 'jotai';
import { useTranslation } from 'react-i18next';
import {
  ContactWidgetRow,
  ContactWidgetSection,
  IContactWidgetProps,
} from 'ui-modules';
import { SALES_CONTACT_DEALS } from './contactDeals';

// The most deals listed for one contact.
const CONTACT_RECORDS_LIMIT = 50;

type TContactDeal = {
  _id: string;
  name?: string | null;
  boardId?: string | null;
  pipelineId?: string | null;
  stage?: { name?: string | null; pipelineId?: string | null } | null;
};

// Deals open on their board, in a new tab, as from the relation widget.
const openDeal = (deal: TContactDeal) => {
  const params = new URLSearchParams({ salesItemId: deal._id });
  const pipelineId = deal.pipelineId || deal.stage?.pipelineId;

  if (deal.boardId) {
    params.set('boardId', deal.boardId);
  }

  if (pipelineId) {
    params.set('pipelineId', pipelineId);
  }

  window.open(`/sales/deals?${params.toString()}`, '_blank');
};

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
  const setOpenCreateDeal = useSetAtom(dealCreateSheetState);
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
      onCreate={() => setOpenCreateDeal(true)}
      renderItem={(dealId) => {
        const deal = dealsById.get(dealId);

        return (
          deal && (
            <ContactWidgetRow
              title={deal.name || t('untitled', 'Untitled')}
              meta={deal.stage?.name}
              onClick={() => openDeal(deal)}
            />
          )
        );
      }}
    >
      <AddDealSheet contacts={contacts} showWorkflowFields />
    </ContactWidgetSection>
  );
};
