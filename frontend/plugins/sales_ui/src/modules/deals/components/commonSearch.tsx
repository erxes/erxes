import { IconCalendar, IconLoader2, IconSearch } from '@tabler/icons-react';
import {
  Badge,
  Button,
  CalendarTwoMonths,
  Dialog,
  Input,
  Select,
  Skeleton,
  Tabs,
  ToggleGroup,
} from 'erxes-ui';

import { IDeal } from '@/deals/types/deals';
import { dealDetailSheetState } from '@/deals/states/dealDetailSheetState';
import { highlightMatch } from '@/deals/utils/highlightMatch';
import { TDealSearchSortOrder, useDealSearch } from '../hooks/useDealSearch';
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
type TDateRangeMode = 'day' | 'month' | 'quarter' | 'halfYear' | 'year';

const DATE_RANGE_YEARS = Array.from(
  { length: 13 },
  (_, index) => new Date().getFullYear() - 7 + index,
);

const MONTH_LABELS = Array.from({ length: 12 }, (_, month) =>
  new Intl.DateTimeFormat(undefined, { month: 'short' }).format(
    new Date(2024, month, 1),
  ),
);

const getPeriodDateRange = (
  year: number,
  startMonth: number,
  monthCount: number,
): DateRange => ({
  from: new Date(year, startMonth, 1),
  to: new Date(year, startMonth + monthCount, 0),
});

const isSameDateRange = (left?: DateRange, right?: DateRange) =>
  left?.from?.getTime() === right?.from?.getTime() &&
  left?.to?.getTime() === right?.to?.getTime();

const getDatePeriodOptions = (mode: TDateRangeMode, year: number) => {
  if (mode === 'month') {
    return MONTH_LABELS.map((label, month) => ({
      label,
      range: getPeriodDateRange(year, month, 1),
    }));
  }

  if (mode === 'quarter') {
    return Array.from({ length: 4 }, (_, quarter) => ({
      label: `Q${quarter + 1}`,
      range: getPeriodDateRange(year, quarter * 3, 3),
    }));
  }

  if (mode === 'halfYear') {
    return Array.from({ length: 2 }, (_, half) => ({
      label: `H${half + 1}`,
      range: getPeriodDateRange(year, half * 6, 6),
    }));
  }

  return [
    {
      label: String(year),
      range: getPeriodDateRange(year, 0, 12),
    },
  ];
};

const isSearchReady = (search: string, category: TDealSearchCategory) => {
  if (category === 'date') {
    return /^\d{4}-\d{2}-\d{2}$/.test(search);
  }

  return search.length >= 2;
};

export const CommonDealSearch = () => {
  const { t } = useTranslation('sales');
  const navigate = useNavigate();
  const setActiveDealId = useSetAtom(dealDetailSheetState);

  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(false);
  const [dateDialogOpen, setDateDialogOpen] = useState(false);
  const [dateRange, setDateRange] = useState<DateRange>();
  const [draftDateRange, setDraftDateRange] = useState<DateRange>();
  const [dateRangeMode, setDateRangeMode] = useState<TDateRangeMode>('day');
  const [category, setCategory] = useState<TDealSearchCategory>('name');
  const [sortOrder, setSortOrder] = useState<TDealSearchSortOrder>('newest');
  const trimmedSearch = search.trim();
  const [debouncedSearch] = useDebounce(trimmedSearch, 350);
  const dealNumber = debouncedSearch.replace(/^#\s*/, '');
  const searchSettled =
    category === 'date' || debouncedSearch === trimmedSearch;
  const searchReady =
    category === 'date'
      ? Boolean(dateRange?.from)
      : isSearchReady(debouncedSearch, category);
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

  const selectedDateLabel = dateRange?.from
    ? dateRange.to
      ? `${dealDateFormatter.format(
          dateRange.from,
        )} – ${dealDateFormatter.format(dateRange.to)}`
      : dealDateFormatter.format(dateRange.from)
    : placeholders.date;

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
                  onClick={() => setDraftDateRange(dateRange)}
                >
                  <IconCalendar className="size-4" />
                  {selectedDateLabel}
                </Button>
              </Dialog.Trigger>
              <Dialog.Content className="max-w-xl gap-0 p-0">
                <Dialog.Header className="space-y-3 p-6">
                  <Dialog.Title className="text-sm capitalize">
                    {t('date-created', 'Date created')}
                  </Dialog.Title>
                  <ToggleGroup
                    type="single"
                    variant="outline"
                    size="sm"
                    value={dateRangeMode}
                    onValueChange={(value) => {
                      if (value) {
                        setDateRangeMode(value as TDateRangeMode);
                      }
                    }}
                    className="inline-flex"
                  >
                    <ToggleGroup.Item
                      className="focus-visible:ring-0 focus-visible:outline-none"
                      value="day"
                    >
                      {t('day', 'Day')}
                    </ToggleGroup.Item>
                    <ToggleGroup.Item
                      className="focus-visible:ring-0 focus-visible:outline-none"
                      value="month"
                    >
                      {t('month', 'Month')}
                    </ToggleGroup.Item>
                    <ToggleGroup.Item
                      className="focus-visible:ring-0 focus-visible:outline-none"
                      value="quarter"
                    >
                      {t('quarter', 'Quarter')}
                    </ToggleGroup.Item>
                    <ToggleGroup.Item
                      className="focus-visible:ring-0 focus-visible:outline-none"
                      value="halfYear"
                    >
                      {t('half-year', 'Half Year')}
                    </ToggleGroup.Item>
                    <ToggleGroup.Item
                      className="focus-visible:ring-0 focus-visible:outline-none"
                      value="year"
                    >
                      {t('year', 'Year')}
                    </ToggleGroup.Item>
                  </ToggleGroup>
                </Dialog.Header>
                <div className="flex h-88 justify-center overflow-auto border-y border-muted py-6">
                  {dateRangeMode === 'day' ? (
                    <CalendarTwoMonths
                      mode="range"
                      numberOfMonths={2}
                      showOutsideDays
                      fixedWeeks
                      defaultMonth={draftDateRange?.from}
                      selected={draftDateRange}
                      onSelect={setDraftDateRange}
                      className="focus-visible:outline-none [&_button:focus-visible]:outline-none [&_button:focus-visible]:ring-0"
                    />
                  ) : (
                    <div
                      className={
                        dateRangeMode === 'month'
                          ? 'grid w-full grid-cols-2 gap-6 px-6 pb-6'
                          : 'flex w-full flex-col gap-6 px-6 pb-6'
                      }
                    >
                      {DATE_RANGE_YEARS.map((year) => (
                        <section className="space-y-3" key={year}>
                          {dateRangeMode !== 'year' && (
                            <h3 className="text-sm font-semibold">{year}</h3>
                          )}
                          <div
                            className={
                              dateRangeMode === 'month'
                                ? 'grid grid-cols-3 gap-1'
                                : dateRangeMode === 'quarter'
                                ? 'grid grid-cols-4 gap-1'
                                : dateRangeMode === 'halfYear'
                                ? 'grid grid-cols-2 gap-1'
                                : 'grid grid-cols-1 gap-1'
                            }
                          >
                            {getDatePeriodOptions(dateRangeMode, year).map(
                              (option) => {
                                const selected = isSameDateRange(
                                  draftDateRange,
                                  option.range,
                                );

                                return (
                                  <Button
                                    key={option.label}
                                    variant="secondary"
                                    className={
                                      selected
                                        ? 'bg-primary text-primary-foreground hover:bg-primary focus-visible:ring-0 focus-visible:outline-none'
                                        : 'focus-visible:ring-0 focus-visible:outline-none'
                                    }
                                    onClick={() =>
                                      setDraftDateRange(option.range)
                                    }
                                  >
                                    {option.label}
                                  </Button>
                                );
                              },
                            )}
                          </div>
                        </section>
                      ))}
                    </div>
                  )}
                </div>
                <Dialog.Footer className="p-6">
                  <Button
                    variant="ghost"
                    size="lg"
                    className="focus-visible:ring-0 focus-visible:outline-none"
                    onClick={() => setDateDialogOpen(false)}
                  >
                    {t('cancel', 'Cancel')}
                  </Button>
                  <Button
                    size="lg"
                    disabled={!draftDateRange?.from}
                    className="focus-visible:ring-0 focus-visible:outline-none"
                    onClick={() => {
                      setDateRange(draftDateRange);
                      setDateDialogOpen(false);
                    }}
                  >
                    {t('apply', 'Apply')}
                  </Button>
                </Dialog.Footer>
              </Dialog.Content>
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

          <Select
            value={sortOrder}
            onValueChange={(value) =>
              setSortOrder(value as TDealSearchSortOrder)
            }
          >
            <Select.Trigger className="mr-2 h-7 w-44 shrink-0 text-xs focus:shadow-none focus:ring-0 focus-visible:ring-0 focus-visible:outline-none">
              <Select.Value />
            </Select.Trigger>
            <Select.Content>
              <Select.Item value="newest">
                {t('newest-to-oldest', 'Newest to oldest')}
              </Select.Item>
              <Select.Item value="oldest">
                {t('oldest-to-newest', 'Oldest to newest')}
              </Select.Item>
            </Select.Content>
          </Select>
        </div>

        <div className="max-h-[50vh] min-h-24 overflow-y-auto">
          {searchSettled && !searchReady && (
            <div className="px-3 py-3 text-sm text-muted-foreground">
              {category === 'date'
                ? t(
                    'select-date-to-search-deals',
                    'Select a date to search deals',
                  )
                : category === 'number'
                ? t(
                    'enter-number-to-search-deals',
                    'Enter at least 2 characters of the deal number',
                  )
                : t(
                    'enter-name-to-search-deals',
                    'Enter at least 2 characters of the name',
                  )}
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
            deals.map((deal) => {
              const hasPipeline = Boolean(
                deal.pipeline?._id && (deal.boardId || deal.pipeline.boardId),
              );

              return (
                <button
                  key={deal._id}
                  type="button"
                  disabled={!hasPipeline}
                  className="grid w-full grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 gap-y-1 px-4 py-3 text-left text-sm hover:bg-muted focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-60"
                  onMouseDown={(event) => {
                    event.preventDefault();
                    handleSelect(deal);
                  }}
                >
                  <span className="min-w-0 truncate font-medium">
                    {highlightMatch(
                      deal.name || t('unnamed-deal', 'Unnamed deal'),
                      category === 'name' ? debouncedSearch : '',
                    )}
                  </span>
                  <span className="whitespace-nowrap font-mono text-xs text-muted-foreground">
                    {deal.number ? (
                      <>
                        #
                        {highlightMatch(
                          deal.number,
                          category === 'number' ? dealNumber : '',
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
                        className="h-4 py-0 bg-yellow-100 text-yellow-800 text-[11px] border-yellow-200"
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
            })}

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
