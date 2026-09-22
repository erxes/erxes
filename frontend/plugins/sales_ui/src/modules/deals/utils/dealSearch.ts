import { TDealSearchCategory } from '@/deals/types/dealSearch';
import type { DateRange } from 'react-day-picker';

const dealDateFormatter = new Intl.DateTimeFormat(undefined, {
  dateStyle: 'medium',
});

export const isDealSearchReady = (
  search: string,
  category: TDealSearchCategory,
) => {
  if (category === 'date') {
    return /^\d{4}-\d{2}-\d{2}$/.test(search);
  }

  return search.length >= 2;
};

export const getDealSearchDateLabel = (
  dateRange: DateRange | undefined,
  fallback: string,
): string => {
  if (!dateRange?.from) return fallback;
  if (!dateRange.to) return dealDateFormatter.format(dateRange.from);

  return `${dealDateFormatter.format(
    dateRange.from,
  )} – ${dealDateFormatter.format(dateRange.to)}`;
};

export const formatDealSearchResultDate = (date: Date | string) =>
  dealDateFormatter.format(new Date(date));

export const getDealSearchPrompt = (
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
