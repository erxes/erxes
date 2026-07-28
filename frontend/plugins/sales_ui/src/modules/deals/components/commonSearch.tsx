import { IconLoader2, IconSearch } from '@tabler/icons-react';
import { Input, Popover, Skeleton } from 'erxes-ui';

import { IDeal } from '@/deals/types/deals';
import { dealDetailSheetState } from '@/deals/states/dealDetailSheetState';
import { useDealSearch } from '../hooks/useDealSearch';
import { useDebounce } from 'use-debounce';
import { useInView } from 'react-intersection-observer';
import { useNavigate } from 'react-router-dom';
import { useSetAtom } from 'jotai';
import { useState } from 'react';
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
  const { ref: loadMoreRef } = useInView({
    onChange: (inView) => inView && loadMore(),
  });

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

          {deals.map((deal) => (
            <button
              key={deal._id}
              type="button"
              className="flex w-full flex-col items-start gap-0.5 px-3 py-2 text-left text-sm hover:bg-muted"
              onMouseDown={(event) => {
                event.preventDefault();
                handleSelect(deal);
              }}
            >
              <span className="font-medium">
                {[deal.number, deal.name].filter(Boolean).join(' - ')}
              </span>
              <span className="text-xs text-muted-foreground">
                {deal.pipeline?.name}
              </span>
            </button>
          ))}

          {pageInfo?.hasNextPage && deals.length < totalCount && (
            <div ref={loadMoreRef} className="px-3 py-2">
              {loadingMore && <Skeleton className="h-8 w-full" />}
            </div>
          )}
        </div>

        {hasDeals && (
          <div className="border-t px-3 py-2 text-xs text-muted-foreground">
            {deals.length} / {totalCount}
          </div>
        )}
      </Popover.Content>
    </Popover>
  );
};
