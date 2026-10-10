import { IconCoins } from '@tabler/icons-react';
import { cn, RecordTable, Separator, Skeleton } from 'erxes-ui';
import { createContext, ReactNode, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { useDealLoyaltyTotals } from '../hooks/useDealLoyaltyTotals';

type TDealLoyaltyTotals = ReturnType<typeof useDealLoyaltyTotals>;

const DealLoyaltyTotalsContext = createContext<TDealLoyaltyTotals | null>(null);

// One question to loyalty for the whole loaded list; cells only read it.
export const DealLoyaltyTotalsProvider = ({
  dealIds,
  children,
}: {
  dealIds: string[];
  children: ReactNode;
}) => (
  <DealLoyaltyTotalsContext.Provider value={useDealLoyaltyTotals(dealIds)}>
    {children}
  </DealLoyaltyTotalsContext.Provider>
);

export const DealLoyaltyPointsHead = () => {
  const { t } = useTranslation('sales');

  return (
    <RecordTable.InlineHead label={t('loyalty-deal-points')} icon={IconCoins} />
  );
};

export const DealLoyaltyPointsCell = ({ dealId }: { dealId: string }) => {
  const totals = useContext(DealLoyaltyTotalsContext);

  if (!totals) {
    return null;
  }

  if (totals.loading) {
    return <Skeleton className="m-2 h-4 w-12" />;
  }

  const total = totals.totalOf(dealId);

  return (
    <span
      className={cn(
        'flex h-full items-center px-2 text-sm tabular-nums',
        total > 0 && 'font-medium text-success',
        total < 0 && 'font-medium text-destructive',
        !total && 'text-muted-foreground',
      )}
    >
      {total > 0 ? '+' : ''}
      {total.toLocaleString()}
    </span>
  );
};

// The foot of a board card; nothing for a deal that moved no points.
export const DealLoyaltyPointsBadge = ({ dealId }: { dealId: string }) => {
  const { t } = useTranslation('sales');
  const totals = useContext(DealLoyaltyTotalsContext);
  const total = totals && !totals.loading ? totals.totalOf(dealId) : 0;

  if (!total) {
    return null;
  }

  return (
    <>
      <Separator />
      <div
        className={cn(
          'flex h-8 items-center gap-1.5 px-3 text-xs font-medium tabular-nums',
          total > 0 ? 'text-success' : 'text-destructive',
        )}
      >
        <IconCoins className="size-3.5" />
        {total > 0 ? '+' : ''}
        {total.toLocaleString()}
        <span className="font-normal text-muted-foreground">
          {t('loyalty-deal-points')}
        </span>
      </div>
    </>
  );
};
