import { useDealRelationTabs } from '@/deals/cards/hooks/useDealRelationTabs';
import { useDealDetail } from '@/deals/cards/hooks/useDeals';
import { dealRelationsFoldedAtom } from '@/deals/states/dealRelationsState';
import { IconChevronRight, IconLink } from '@tabler/icons-react';
import { Button, cn, Empty, ScrollArea, Spinner } from 'erxes-ui';
import { useAtom } from 'jotai';
import { useTranslation } from 'react-i18next';
import type { IRelationWidgetTab } from 'ui-modules';
import {
  DealPanelError,
  DealPanelNotFound,
} from '~/widgets/record-panel/DealPanelStates';

const DealRelationSection = ({ tab }: { tab: IRelationWidgetTab }) => {
  const [foldedMap, setFoldedMap] = useAtom(dealRelationsFoldedAtom);
  const folded = foldedMap[tab.value] ?? true;
  const setFolded = (next: boolean) =>
    setFoldedMap((previous) => ({ ...previous, [tab.value]: next }));

  return (
    <section className="border-b last:border-b-0 py-1">
      <div className="flex items-center h-8 px-1.5">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-7 gap-1.5 px-1.5 text-xs font-medium"
          aria-expanded={!folded}
          onClick={() => setFolded(!folded)}
        >
          <IconChevronRight
            className={cn(
              'size-3.5 text-muted-foreground transition-transform',
              !folded && 'rotate-90',
            )}
          />
          <tab.icon className="size-4 text-muted-foreground" />
          {tab.label}
        </Button>
      </div>
      {!folded && (
        <div className="mx-1.5 mb-1 flex h-80 flex-col overflow-hidden rounded-sm border">
          {tab.content}
        </div>
      )}
    </section>
  );
};

const DealRelationSections = ({
  dealId,
  customerId,
  companyId,
}: {
  dealId: string;
  customerId?: string | null;
  companyId?: string | null;
}) => {
  const { t } = useTranslation('sales');
  const tabs = useDealRelationTabs({ dealId, customerId, companyId });

  if (!tabs.length) {
    return (
      <Empty className="py-12">
        <Empty.Header>
          <Empty.Media variant="icon">
            <IconLink />
          </Empty.Media>
          <Empty.Description>{t('deal-relations-empty')}</Empty.Description>
        </Empty.Header>
      </Empty>
    );
  }

  return (
    <>
      <div className="flex h-9 flex-none items-center justify-between gap-2 border-b px-3">
        <h2 className="min-w-0 truncate text-xs font-medium text-muted-foreground">
          {t('related-records')}
        </h2>
      </div>
      <ScrollArea className="flex-1 min-h-0" viewportClassName="[&>div]:block!">
        {tabs.map((tab) => (
          <DealRelationSection key={tab.value} tab={tab} />
        ))}
      </ScrollArea>
    </>
  );
};

export const DealPanelRelations = ({ dealId }: { dealId: string }) => {
  const { deal, loading, error } = useDealDetail(
    { variables: { _id: dealId }, fetchPolicy: 'cache-first' },
    { subscribe: false },
  );

  if (loading && !deal) {
    return <Spinner containerClassName="py-12" />;
  }

  if (error && !deal) {
    return <DealPanelError error={error} />;
  }

  if (!deal) {
    return <DealPanelNotFound />;
  }

  return (
    <div className="flex flex-1 min-h-0 flex-col">
      <DealRelationSections
        dealId={deal._id}
        customerId={deal.customers?.[0]?._id}
        companyId={deal.companies?.[0]?._id}
      />
    </div>
  );
};
