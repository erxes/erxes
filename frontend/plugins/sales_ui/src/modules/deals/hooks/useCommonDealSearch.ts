import { useDealSearch } from '@/deals/hooks/useDealSearch';
import { dealDetailSheetState } from '@/deals/states/dealDetailSheetState';
import {
  TDealSearchCategory,
  TDealTextSearches,
} from '@/deals/types/dealSearch';
import { IDeal } from '@/deals/types/deals';
import { isDealSearchReady } from '@/deals/utils/dealSearch';
import { TSearchSortOrder } from 'erxes-ui';
import { useSetAtom } from 'jotai';
import { useEffect, useState } from 'react';
import type { DateRange } from 'react-day-picker';
import { useInView } from 'react-intersection-observer';
import { useNavigate } from 'react-router-dom';
import { useDebounce } from 'use-debounce';

const INITIAL_TEXT_SEARCHES: TDealTextSearches = { name: '', number: '' };

export const useCommonDealSearch = () => {
  const navigate = useNavigate();
  const setActiveDealId = useSetAtom(dealDetailSheetState);
  const [searches, setSearches] = useState(INITIAL_TEXT_SEARCHES);
  const [open, setOpen] = useState(false);
  const [dateRange, setDateRange] = useState<DateRange | null>(null);
  const [category, setCategory] = useState<TDealSearchCategory>('name');
  const [sortOrder, setSortOrder] = useState<TSearchSortOrder>('newest');
  const trimmedNameSearch = searches.name.trim();
  const trimmedNumberSearch = searches.number.trim();
  const [debouncedNameSearch] = useDebounce(trimmedNameSearch, 350);
  const [debouncedNumberSearch] = useDebounce(trimmedNumberSearch, 350);
  const dealNumber = debouncedNumberSearch.replace(/^#\s*/, '');
  const nameSearchReady = isDealSearchReady(debouncedNameSearch, 'name');
  const numberSearchReady = isDealSearchReady(dealNumber, 'number');
  const activeSearch = category === 'date' ? '' : searches[category].trim();
  const normalizedActiveSearch =
    category === 'number' ? activeSearch.replace(/^#\s*/, '') : activeSearch;
  const searchSettled =
    debouncedNameSearch === trimmedNameSearch &&
    debouncedNumberSearch === trimmedNumberSearch;
  const hasSearchFilter =
    Boolean(dateRange?.from) || nameSearchReady || numberSearchReady;
  const hasIncompleteActiveSearch =
    category !== 'date' &&
    Boolean(activeSearch) &&
    !isDealSearchReady(normalizedActiveSearch, category);
  const resultsReady =
    hasSearchFilter && searchSettled && !hasIncompleteActiveSearch;

  const searchResult = useDealSearch(
    nameSearchReady ? debouncedNameSearch : '',
    sortOrder,
    dateRange?.from ? dateRange : undefined,
    numberSearchReady ? dealNumber : undefined,
  );
  const { ref: loadMoreRef, inView: loadMoreInView } = useInView();

  useEffect(() => {
    if (loadMoreInView) {
      searchResult.loadMore();
    }
  }, [loadMoreInView, searchResult.loadMore]);

  const setActiveSearch = (value: string) => {
    if (category === 'date') return;

    setSearches((current) => ({ ...current, [category]: value }));
  };

  const setSearchDateRange = (value?: DateRange) => {
    setDateRange(value ?? null);
  };

  const selectDeal = (deal: IDeal) => {
    const pipelineId = deal.pipeline?._id;
    const boardId = deal.boardId || deal.pipeline?.boardId;

    if (!pipelineId || !boardId) return;

    setActiveDealId(deal._id);
    setSearches(INITIAL_TEXT_SEARCHES);
    setDateRange(null);
    setOpen(false);
    navigate(
      `/sales/deals?boardId=${boardId}&pipelineId=${pipelineId}&salesItemId=${deal._id}`,
    );
  };

  return {
    ...searchResult,
    category,
    dateRange: dateRange ?? undefined,
    loadMoreRef,
    nameSearch: nameSearchReady ? debouncedNameSearch : '',
    nameSearchReady,
    numberSearch: numberSearchReady ? dealNumber : '',
    numberSearchReady,
    open,
    resultsReady,
    searchSettled,
    searches,
    selectDeal,
    setActiveSearch,
    setCategory,
    setDateRange: setSearchDateRange,
    setOpen,
    setSortOrder,
    sortOrder,
  };
};
