import { useOpenDealPanel } from '@/deals/hooks/useOpenDealPanel';
import { IconSandbox } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { ContactWidgetSection, IContactWidgetProps } from 'ui-modules';
import { DealContactRow } from './DealContactRow';
import { useContactDeals } from './useContactDeals';
import { useDealConnectionAccess } from './useDealConnectionAccess';

export const DealsContactSection = ({
  contentType,
  contentId,
}: Omit<IContactWidgetProps, 'module'>) => {
  const { t } = useTranslation('sales');
  const isCompany = contentType === 'core:company';
  const { dealsById, loading } = useContactDeals(
    isCompany ? { companyId: contentId } : { customerId: contentId },
  );
  const { canAdd, addDeal } = useDealConnectionAccess();
  const defaults = isCompany
    ? { companyId: contentId }
    : { customerId: contentId };
  const openDealPanel = useOpenDealPanel();

  return (
    <ContactWidgetSection
      icon={IconSandbox}
      label={t('deals', 'Deals')}
      ids={[...dealsById.keys()]}
      loading={loading}
      createLabel={t('connect-deal', 'Connect deal')}
      onCreate={
        canAdd ? () => addDeal({ contentType, contentId }, defaults) : undefined
      }
      renderItem={(dealId) => {
        const deal = dealsById.get(dealId);

        return (
          deal && (
            <DealContactRow
              deal={deal}
              onClick={() => openDealPanel(deal._id, { stack: true })}
            />
          )
        );
      }}
    />
  );
};
