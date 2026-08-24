import { IconCalendar, IconLoader2, IconSearch } from '@tabler/icons-react';
import {
  Badge,
  Button,
  DateRangeDialogContent,
  Dialog,
  highlightMatch,
  Input,
  parseDateRangeFromString,
  SearchOrderSelect,
  Skeleton,
  Tabs,
} from 'erxes-ui';

import { IDeal } from '@/deals/types/deals';
import { dealDetailSheetState } from '@/deals/states/dealDetailSheetState';
import {
  TDealSearchSortOrder,
  useDealSearch,
} from '@/deals/hooks/useDealSearch';
import { useDebounce } from 'use-debounce';
import { useInView } from 'react-intersection-observer';
import { useNavigate } from 'react-router-dom';
import { useSetAtom } from 'jotai';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { DateRange } from 'react-day-picker';

const dealDateFormatter = new Intl.DateTimeFormat(undefined, {
  dateStyle: 'medium',
});

type TDealSearchCategory = 'date' | 'number' | 'name';

const isSearchReady = (search: string, category: TDealSearchCategory) => {
  if (category === 'date') {
    return /^\d{4}-\d{2}-\d{2}$/.test(search);
  }

  return search.length >= 2;
};

const getDateLabel = (
  dateRange: DateRange | undefined,
  fallback: string,
): string => {
  if (!dateRange?.from) return fallback;
  if (!dateRange.to) return dealDateFormatter.format(dateRange.from);

  return `${dealDateFormatter.format(
    dateRange.from,
  )} – ${dealDateFormatter.format(dateRange.to)}`;
};

const getSearchPromptKey = (
  category: TDealSearchCategory,
): readonly [string, string] => {
  if (category === 'date') {
    return ['select-date-to-search-deals', 'Select a date to search deals'];
  }
  if (category === 'number') {
    return [
      'enter-number-to-search-deals',
      'Enter at least 2 characters of the deal number',
    ];
  }
  return [
    'enter-name-to-search-deals',
    'Enter at least 2 characters of the name',
  ];
};

const DealSearchResult = ({
  deal,
  category,
  nameSearch,
  numberSearch,
  onSelect,
}: {
  deal: IDeal;
  category: TDealSearchCategory;
  nameSearch: string;
  numberSearch: string;
  onSelect: (deal: IDeal) => void;
}) => {
  const { t } = useTranslation('sales');
  const hasPipeline = Boolean(
    deal.pipeline?._id && (deal.boardId || deal.pipeline.boardId),
  );

  return (
    <button
      type="button"
      disabled={!hasPipeline}
      className="grid w-full grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 gap-y-1 px-4 py-3 text-left text-sm hover:bg-muted focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-60"
      onClick={() => onSelect(deal)}
    >
      <span className="min-w-0 truncate font-medium">
        {highlightMatch(
          deal.name || t('unnamed-deal', 'Unnamed deal'),
          category === 'name' ? nameSearch : '',
        )}
      </span>
      <span className="whitespace-nowrap font-mono text-xs text-muted-foreground">
        {deal.number ? (
          <>
            #
            {highlightMatch(
              deal.number,
              category === 'number' ? numberSearch : '',
            )}
          </>
        ) : (
          '—'
        )}
      </span>
      <span className="flex min-w-0 items-center gap-2 truncate text-xs text-muted-foreground">
        {deal.pipeline?.name || t('no-pipeline')}
        {deal.status === 'archived' && (
          <Badge
            variant="secondary"
            className="h-4 border-yellow-200 bg-yellow-100 py-0 text-[11px] text-yellow-800"
          >
            {t('archived')}
          </Badge>
        )}
      </span>
      <time
        className="whitespace-nowrap text-xs text-muted-foreground"
        dateTime={deal.createdAt?.toString()}
      >
        {deal.createdAt
          ? dealDateFormatter.format(new Date(deal.createdAt))
          : '—'}
      </time>
    </button>
  );
};

export const CommonDealSearch = () => {
  const { t } = useTranslation('sales');
  const navigate = useNavigate();
  const setActiveDealId = useSetAtom(dealDetailSheetState);

  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(false);
  const [dateDialogOpen, setDateDialogOpen] = useState(false);
  const [dateRange, setDateRange] = useState<DateRange>();
  const [category, setCategory] = useState<TDealSearchCategory>('name');
  const [sortOrder, setSortOrder] = useState<TDealSearchSortOrder>('newest');
  const trimmedSearch = search.trim();
  const [debouncedSearch] = useDebounce(trimmedSearch, 350);
  const dealNumber = debouncedSearch.replace(/^#\s*/, '');
  const searchSettled =
    category === 'date' || debouncedSearch === trimmedSearch;
  const searchReady =
    (category === 'date' && Boolean(dateRange?.from)) ||
    (category !== 'date' && isSearchReady(debouncedSearch, category));
  const resultsReady = searchReady && searchSettled;

  const { deals, loading, loadingMore, totalCount, pageInfo, loadMore } =
    useDealSearch(
      category === 'name' && searchReady ? debouncedSearch : '',
      sortOrder,
      category === 'date' ? dateRange : undefined,
      category === 'number' && searchReady ? dealNumber : undefined,
    );
  const { ref: loadMoreRef, inView: loadMoreInView } = useInView();

  useEffect(() => {
    if (loadMoreInView) {
      loadMore();
    }
  }, [loadMore, loadMoreInView]);

  const hasDeals = resultsReady && deals.length > 0;

  const placeholders: Record<TDealSearchCategory, string> = {
    date: t('search-deals-by-date', 'Search by date'),
    number: t('search-deals-by-number', 'Search by deal number, e.g. #0000'),
    name: t('search-deals-by-name', 'Search by name'),
  };

  const selectedDateLabel = getDateLabel(dateRange, placeholders.date);
  const [searchPromptKey, searchPromptFallback] = getSearchPromptKey(category);

  const handleSelect = (deal: IDeal) => {
    const pipelineId = deal.pipeline?._id;
    const boardId = deal.boardId || deal.pipeline?.boardId;

    if (!pipelineId || !boardId) {
      return;
    }

    setActiveDealId(deal._id);
    setSearch('');
    setOpen(false);
    navigate(
      `/sales/deals?boardId=${boardId}&pipelineId=${pipelineId}&salesItemId=${deal._id}`,
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <Button
          variant="ghost"
          className="font-normal focus-visible:ring-0 focus-visible:outline-none"
        >
          <IconSearch className="size-4" />
          {t('search-deals')}
        </Button>
      </Dialog.Trigger>

      <Dialog.Content className="w-[calc(100vw-2rem)] max-h-[85vh] max-w-2xl gap-0 overflow-hidden border-0 p-0">
        <Dialog.Title className="sr-only">{t('search-deals')}</Dialog.Title>
        <Dialog.Description className="sr-only">
          {t(
            'search-deals-description',
            'Search deals by date, deal number, or name',
          )}
        </Dialog.Description>

        <div className="border-b">
          {category === 'date' ? (
            <Dialog open={dateDialogOpen} onOpenChange={setDateDialogOpen}>
              <Dialog.Trigger asChild>
                <Button
                  variant="ghost"
                  className="h-10 w-full justify-start rounded-none px-3 font-normal text-muted-foreground hover:bg-transparent focus-visible:ring-0 focus-visible:outline-none"
                >
                  <IconCalendar className="size-4" />
                  {selectedDateLabel}
                </Button>
              </Dialog.Trigger>
              <DateRangeDialogContent
                label={t('date-created', 'Date created')}
                value={
                  dateRange?.from
                    ? `${dateRange.from.toISOString()},${(
                        dateRange.to ?? dateRange.from
                      ).toISOString()}`
                    : null
                }
                onApply={(value) => {
                  setDateRange(parseDateRangeFromString(value));
                  setDateDialogOpen(false);
                }}
              />
            </Dialog>
          ) : (
            <div className="relative">
              <IconSearch className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                autoFocus
                className="h-10 rounded-none border-0 pl-9 shadow-none focus-visible:shadow-none focus-visible:ring-0 focus-visible:outline-none"
                type="search"
                placeholder={placeholders[category]}
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </div>
          )}
        </div>

        <div className="flex items-center border-b">
          <Tabs
            className="min-w-0 flex-1"
            value={category}
            onValueChange={(value) => {
              setCategory(value as TDealSearchCategory);
              setSearch('');
            }}
          >
            <Tabs.List
              variant="underline"
              className="flex w-full justify-start gap-1 border-b-0 px-2 py-0"
            >
              <Tabs.Trigger
                className="h-8 px-2 text-xs transition-none hover:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:outline-none data-[state=active]:hover:bg-transparent"
                value="date"
              >
                {t('by-date', 'By date')}
              </Tabs.Trigger>
              <Tabs.Trigger
                className="h-8 px-2 text-xs transition-none hover:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:outline-none data-[state=active]:hover:bg-transparent"
                value="number"
              >
                {t('by-deal-number', 'By deal number')}
              </Tabs.Trigger>
              <Tabs.Trigger
                className="h-8 px-2 text-xs transition-none hover:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:outline-none data-[state=active]:hover:bg-transparent"
                value="name"
              >
                {t('by-name', 'By name')}
              </Tabs.Trigger>
            </Tabs.List>
          </Tabs>

          <SearchOrderSelect
            value={sortOrder}
            newestLabel={t('newest-to-oldest', 'Newest to oldest')}
            oldestLabel={t('oldest-to-newest', 'Oldest to newest')}
            triggerClassName="mr-2 h-7 w-44 shrink-0 text-xs focus:shadow-none focus:ring-0 focus-visible:ring-0 focus-visible:outline-none"
            onValueChange={setSortOrder}
          />
        </div>

        <div className="max-h-[50vh] min-h-24 overflow-y-auto">
          {searchSettled && !searchReady && (
            <div className="px-3 py-3 text-sm text-muted-foreground">
              {t(searchPromptKey, searchPromptFallback)}
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
                category={category}
                deal={deal}
                nameSearch={debouncedSearch}
                numberSearch={dealNumber}
                onSelect={handleSelect}
              />
            ))}

          {resultsReady &&
            pageInfo?.hasNextPage &&
            deals.length < totalCount && (
              <div ref={loadMoreRef} className="px-3 py-2">
                {loadingMore && <Skeleton className="h-8 w-full" />}
              </div>
            )}
        </div>

        {resultsReady && hasDeals && (
          <div className="border-t px-3 py-2 text-xs text-muted-foreground">
            {t('count-out-of', {
              current: deals.length,
              total: totalCount,
            })}
          </div>
        )}
      </Dialog.Content>
    </Dialog>
  );
};
