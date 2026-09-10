import { DealSearchResult } from '@/deals/components/search/DealSearchResult';
import { TDealSearchCategory } from '@/deals/types/dealSearch';
import { IDeal } from '@/deals/types/deals';
import { getDealSearchPrompt } from '@/deals/utils/dealSearch';
import { IconLoader2 } from '@tabler/icons-react';
import { Skeleton } from 'erxes-ui';
import { Ref } from 'react';
import { useTranslation } from 'react-i18next';

type TDealSearchResultsProps = {
  category: TDealSearchCategory;
  deals: IDeal[];
  loading: boolean;
  loadingMore: boolean;
  nameSearch: string;
  numberSearch: string;
  resultsReady: boolean;
  searchSettled: boolean;
  totalCount: number;
  hasNextPage?: boolean;
  loadMoreRef: Ref<HTMLDivElement>;
  onSelect: (deal: IDeal) => void;
};

export const DealSearchResults = ({
  category,
  deals,
  loading,
  loadingMore,
  nameSearch,
  numberSearch,
  resultsReady,
  searchSettled,
  totalCount,
  hasNextPage,
  loadMoreRef,
  onSelect,
}: TDealSearchResultsProps) => {
  const { t } = useTranslation('sales');
  const [promptKey, promptFallback] = getDealSearchPrompt(category);
  const hasDeals = resultsReady && deals.length > 0;

  return (
    <>
      <div className="max-h-[50vh] min-h-24 overflow-y-auto">
        {searchSettled && !resultsReady && (
          <div className="px-3 py-3 text-sm text-muted-foreground">
            {t(promptKey, promptFallback)}
          </div>
        )}

        {(!searchSettled || (resultsReady && loading && !hasDeals)) && (
          <div className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground">
            <IconLoader2 className="size-4 animate-spin" />
            {t('searching')}
          </div>
        )}

        {resultsReady && !loading && !hasDeals && (
          <div className="px-3 py-2 text-sm text-muted-foreground">
            {t('no-deals-found')}
          </div>
        )}

        {resultsReady &&
          deals.map((deal) => (
            <DealSearchResult
              key={deal._id}
              deal={deal}
              nameSearch={nameSearch}
              numberSearch={numberSearch}
              onSelect={onSelect}
            />
          ))}

        {resultsReady && hasNextPage && deals.length < totalCount && (
          <div ref={loadMoreRef} className="px-3 py-2">
            {loadingMore && <Skeleton className="h-8 w-full" />}
          </div>
        )}
      </div>

      {resultsReady && hasDeals && (
        <div className="border-t px-3 py-2 text-xs text-muted-foreground">
          {t('count-out-of', { current: deals.length, total: totalCount })}
        </div>
      )}
    </>
  );
};
