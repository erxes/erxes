import { IconLoader2, IconSearch } from '@tabler/icons-react';
import { Input, Popover, Skeleton, Badge } from 'erxes-ui';

import { IDeal } from '@/deals/types/deals';
import { dealDetailSheetState } from '@/deals/states/dealDetailSheetState';
import { useDealSearch } from '../hooks/useDealSearch';
import { useDebounce } from 'use-debounce';
import { useInView } from 'react-intersection-observer';
import { useNavigate } from 'react-router-dom';
import { useSetAtom } from 'jotai';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

export const CommonDealSearch = () => {
  const { t } = useTranslation('sales');
  const navigate = useNavigate();
  const setActiveDealId = useSetAtom(dealDetailSheetState);

  const [search, setSearch] = useState('');
  const [focused, setFocused] = useState(false);
  const [debouncedSearch] = useDebounce(search.trim(), 350);

  const { deals, loading, loadingMore, totalCount, pageInfo, loadMore } =
    useDealSearch(debouncedSearch);
  const { ref: loadMoreRef, inView: loadMoreInView } = useInView();

  useEffect(() => {
    if (loadMoreInView) {
      loadMore();
    }
  }, [loadMore, loadMoreInView]);

  const showDropdown = focused && debouncedSearch.length >= 2;
  const hasDeals = deals.length > 0;

  const handleSelect = (deal: IDeal) => {
    const pipelineId = deal.pipeline?._id;
    const boardId = deal.boardId || deal.pipeline?.boardId;

    if (!pipelineId || !boardId) {
      return;
    }

    setActiveDealId(deal._id);
    setSearch('');
    setFocused(false);
    navigate(
      `/sales/deals?boardId=${boardId}&pipelineId=${pipelineId}&salesItemId=${deal._id}`,
    );
  };

  return (
    <Popover open={showDropdown}>
      <Popover.Anchor asChild>
        <div className="relative w-72">
          <IconSearch className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="h-8 pl-8"
            placeholder={t('search-deals')}
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
          />
        </div>
      </Popover.Anchor>

      <Popover.Content
        align="end"
        sideOffset={4}
        className="w-96 overflow-hidden p-0"
        onOpenAutoFocus={(event) => event.preventDefault()}
      >
        <div className="max-h-120 overflow-y-auto">
          {loading && !hasDeals && (
            <div className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground">
              <IconLoader2 className="size-4 animate-spin" />
              {t('searching')}
            </div>
          )}

          {!loading && !hasDeals && (
            <div className="px-3 py-2 text-sm text-muted-foreground">
              {t('no-deals-found')}
            </div>
          )}

          {deals.map((deal) => {
            const hasPipeline = Boolean(
              deal.pipeline?._id && (deal.boardId || deal.pipeline.boardId),
            );

            return (
              <button
                key={deal._id}
                type="button"
                disabled={!hasPipeline}
                className="flex w-full flex-col items-start gap-0.5 px-3 py-2 text-left text-sm hover:bg-muted disabled:cursor-not-allowed disabled:opacity-60"
                onMouseDown={(event) => {
                  event.preventDefault();
                  handleSelect(deal);
                }}
              >
                <span className="font-medium">
                  {[deal.number, deal.name].filter(Boolean).join(' - ')}
                </span>
                <span className="flex items-center gap-2 text-xs text-muted-foreground">
                  {deal.pipeline?.name || t('no-pipeline')}
                  {deal.status === 'archived' && (
                    <Badge
                      variant="secondary"
                      className="h-4 py-0 bg-yellow-100 text-yellow-800 text-[11px] border-yellow-200"
                    >
                      {t('archived')}
                    </Badge>
                  )}
                </span>
              </button>
            );
          })}

          {pageInfo?.hasNextPage && deals.length < totalCount && (
            <div ref={loadMoreRef} className="px-3 py-2">
              {loadingMore && <Skeleton className="h-8 w-full" />}
            </div>
          )}
        </div>

        {hasDeals && (
          <div className="border-t px-3 py-2 text-xs text-muted-foreground">
            {t('count-out-of', {
              current: deals.length,
              total: totalCount,
            })}
          </div>
        )}
      </Popover.Content>
    </Popover>
  );
};
