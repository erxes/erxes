const NUMBER_FORMATTER = new Intl.NumberFormat('en-US');

const SHORT_NUMBER_FORMATTER = new Intl.NumberFormat('en-US', {
  maximumFractionDigits: 1,
  notation: 'compact',
});

const PERCENT_FORMATTER = new Intl.NumberFormat('en-US', {
  maximumFractionDigits: 1,
  style: 'percent',
});

const DATE_FORMATTER = new Intl.DateTimeFormat('en-US', {
  day: 'numeric',
  month: 'short',
});

const parseAnalyticsDate = (value: string) => {
  if (/^\d{8}$/.test(value)) {
    const year = value.slice(0, 4);
    const month = value.slice(4, 6);
    const day = value.slice(6, 8);
    return new Date(`${year}-${month}-${day}T00:00:00`);
  }

  return new Date(value);
};

export const formatAnalyticsNumber = (value: number) =>
  NUMBER_FORMATTER.format(value);

export const formatAnalyticsShortNumber = (value: number) =>
  SHORT_NUMBER_FORMATTER.format(value);

export const formatAnalyticsPercent = (value: number) =>
  PERCENT_FORMATTER.format(value / 100);

export const formatAnalyticsDuration = (seconds: number) => {
  if (seconds < 60) {
    return `${Math.round(seconds)}s`;
  }

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.round(seconds % 60);

  return `${minutes}m ${remainingSeconds}s`;
};

export const formatAnalyticsDate = (value: string) =>
  DATE_FORMATTER.format(parseAnalyticsDate(value));
