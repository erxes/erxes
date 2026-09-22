import { Button, ScrollArea, Separator, Spinner } from 'erxes-ui';
import { IconCaretLeftRight, IconPlus } from '@tabler/icons-react';
import { useCreateMultipleRelations, useRelations } from 'ui-modules';

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
}: {
  contentId: string;
  contentType: string;
  customerId?: string;
  companyId?: string;
}) => {
  const { t } = useTranslation('sales');
  const { ownEntities, loading: loadingRelations } = useRelations({
    variables: {
      contentId,
      contentType,
      relatedContentType: 'sales:deal',
    },
  });

  const { createMultipleRelations } = useCreateMultipleRelations();
  const setOpenCreateDeal = useSetAtom(dealCreateSheetState);

  if (loadingRelations) {
    return <Spinner containerClassName="py-20" />;
  }

  const onComplete = (dealId: string) => {
    const createRelation = (ct: string, cid: string) => ({
      entities: [
        { contentType: ct, contentId: cid },
        { contentType: 'sales:deal', contentId: dealId },
      ],
    });

    const relationKeys = new Set<string>();

    const relations = [
      [contentType, contentId],
      ...(customerId ? [['core:customer', customerId]] : []),
      ...(companyId ? [['core:company', companyId]] : []),
    ]
      .filter(([ct, cid]) => {
        const key = `${ct}:${cid}`;
        if (relationKeys.has(key)) {
          return false;
        }
        relationKeys.add(key);
        return true;
      })
      .map(([ct, cid]) => createRelation(ct, cid));

    createMultipleRelations(relations);
  };

  const handleDealOpen = () => {
    setOpenCreateDeal(true);
  };

  if (ownEntities?.length === 0) {
    return (
      <div className="flex flex-auto flex-col gap-4 justify-center items-center text-muted-foreground">
        <div className="border border-dashed p-6 bg-background rounded-xl">
          <IconCaretLeftRight />
        </div>
        <span className="text-sm">{t('no-deals-to-display')}</span>
        <Button variant="secondary" onClick={handleDealOpen}>
          <IconPlus />
          {t('add-a-deal')}
        </Button>
        <AddDealSheet onComplete={onComplete} showWorkflowFields={true} />
        <ChooseDealSheet onComplete={onComplete} showText={true} />
      </div>
    );
  }

  return (
    <>
      <div className="h-11 px-4 flex items-center gap-2 flex-none bg-background justify-between">
        <span className="font-medium text-primary">{t('deals')}</span>
        <div className="flex gap-2 items-center">
          <Button variant="secondary" onClick={handleDealOpen}>
            <IconPlus />
          </Button>
          <AddDealSheet onComplete={onComplete} showWorkflowFields={true} />
          <ChooseDealSheet onComplete={onComplete} />
        </div>
      </div>
      <Separator />
      <ScrollArea className="flex-auto">
        <div className="flex flex-col gap-4 p-4">
          {ownEntities?.map((entity) => (
            <DealWidget key={entity.contentId} dealId={entity.contentId} />
          ))}
        </div>
      </ScrollArea>
    </>
  );
};
