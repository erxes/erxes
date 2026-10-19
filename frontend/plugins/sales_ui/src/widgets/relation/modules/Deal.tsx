import { Button, Spinner } from 'erxes-ui';
import { IconCaretLeftRight, IconPlus } from '@tabler/icons-react';
import {
  IRelationWidgetProps,
  RelationWidgetContactsSection,
  RelationWidgetEmptyState,
  RelationWidgetList,
  useContactRelations,
  useRelateRecord,
  useRelations,
} from 'ui-modules';

import { AddDealSheet } from '@/deals/components/AddDealSheet';
import ChooseDealSheet from '@/deals/components/ChooseDealSheet';
import { DealWidget } from './DealWidget';
import { dealCreateSheetState } from '@/deals/states/dealCreateSheetState';
import { useSetAtom } from 'jotai';
import { useTranslation } from 'react-i18next';

export const Deal = ({
  contentId,
  contentType,
  customerId,
  companyId,
  customerIds,
  companyIds,
}: Omit<IRelationWidgetProps, 'module' | 'pluginName'>) => {
  const { t } = useTranslation('sales');
  const { relatedIds, loading: loadingRelations } = useRelations({
    variables: {
      contentId,
      contentType,
      relatedContentType: 'sales:deal',
    },
  });

  const { relateRecord } = useRelateRecord({
    contentType,
    contentId,
    relatedContentType: 'sales:deal',
    customerId,
    companyId,
    customerIds,
    companyIds,
  });

  const contactRecords = useContactRelations({
    contentType,
    contentId,
    relatedContentType: 'sales:deal',
    customerId,
    companyId,
    customerIds,
    companyIds,
    excludeIds: relatedIds,
  });
  const setOpenCreateDeal = useSetAtom(dealCreateSheetState);

  if (loadingRelations || contactRecords.loading) {
    return <Spinner containerClassName="py-20" />;
  }

  const handleDealOpen = () => {
    setOpenCreateDeal(true);
  };

  if (relatedIds.length === 0 && contactRecords.relatedIds.length === 0) {
    return (
      <RelationWidgetEmptyState
        icon={IconCaretLeftRight}
        message={t('no-deals-to-display')}
      >
        <Button variant="secondary" onClick={handleDealOpen}>
          <IconPlus />
          {t('add-a-deal')}
        </Button>
        <AddDealSheet onComplete={relateRecord} showWorkflowFields={true} />
        <ChooseDealSheet onComplete={relateRecord} showText={true} />
      </RelationWidgetEmptyState>
    );
  }

  return (
    <RelationWidgetList
      label={t('deals')}
      actions={
        <>
          <Button variant="secondary" onClick={handleDealOpen}>
            <IconPlus />
          </Button>
          <AddDealSheet onComplete={relateRecord} showWorkflowFields={true} />
          <ChooseDealSheet onComplete={relateRecord} />
        </>
      }
    >
      {relatedIds.map((dealId) => (
        <DealWidget key={dealId} dealId={dealId} />
      ))}
      {contactRecords.relatedIds.length > 0 && (
        <RelationWidgetContactsSection>
          {contactRecords.relatedIds.map((dealId) => (
            <DealWidget key={dealId} dealId={dealId} />
          ))}
        </RelationWidgetContactsSection>
      )}
    </RelationWidgetList>
  );
};
