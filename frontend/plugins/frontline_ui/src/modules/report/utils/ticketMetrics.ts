import { TicketListItem } from '@/report/hooks/useTicketList';
import { TICKET_STATUS_TYPES } from '@/status/constants';
import { formatDate } from 'date-fns';

const MINUTES_PER_HOUR = 60;
const MINUTES_PER_DAY = 24 * MINUTES_PER_HOUR;
const MINUTE_MS = 60 * 1000;
const DAY_MS = MINUTES_PER_DAY * MINUTE_MS;

const EMPTY_VALUE = '—';

const FINAL_STATUS_TYPES = new Set<number>([
  TICKET_STATUS_TYPES.RESOLVED,
  TICKET_STATUS_TYPES.CLOSED,
  TICKET_STATUS_TYPES.CANCELLED,
]);

export const toTimestamp = (value?: string): number | undefined => {
  if (!value) {
    return undefined;
  }

  const timestamp = new Date(value).getTime();
  return Number.isNaN(timestamp) ? undefined : timestamp;
};

export const formatTimestamp = (value?: string): string => {
  const timestamp = toTimestamp(value);

  return timestamp === undefined
    ? EMPTY_VALUE
    : formatDate(timestamp, 'dd/MM/yyyy HH:mm:ss');
};

export const formatElapsedTime = (milliseconds?: number): string => {
  if (milliseconds === undefined || milliseconds < 0) {
    return EMPTY_VALUE;
  }

  const totalMinutes = Math.round(milliseconds / MINUTE_MS);
  const days = Math.floor(totalMinutes / MINUTES_PER_DAY);
  const hours = Math.floor((totalMinutes % MINUTES_PER_DAY) / MINUTES_PER_HOUR);
  const minutes = totalMinutes % MINUTES_PER_HOUR;

  return [days ? `${days}d` : '', hours ? `${hours}h` : '', `${minutes}m`]
    .filter(Boolean)
    .join(' ');
};

export const formatDays = (days?: number): string =>
  days === undefined ? EMPTY_VALUE : `${Number(days.toFixed(1))}d`;

export const getAverageStatusUpdateTime = ({
  createdAt,
  statusChangeLog,
}: TicketListItem): number | undefined => {
  let previousTimestamp = toTimestamp(createdAt);
  const durations: number[] = [];

  for (const activity of statusChangeLog ?? []) {
    const currentTimestamp =
      toTimestamp(activity.updatedAt) ?? toTimestamp(activity.createdAt);

    if (currentTimestamp === undefined) {
      continue;
    }

    if (
      previousTimestamp !== undefined &&
      currentTimestamp >= previousTimestamp
    ) {
      durations.push(currentTimestamp - previousTimestamp);
    }

    previousTimestamp = currentTimestamp;
  }

  if (!durations.length) {
    return undefined;
  }

  return (
    durations.reduce((total, duration) => total + duration, 0) /
    durations.length
  );
};

export const getDaysToFinalStatus = ({
  status,
  createdAt,
  statusChangedDate,
}: TicketListItem): number | undefined => {
  if (status?.type === undefined || !FINAL_STATUS_TYPES.has(status.type)) {
    return undefined;
  }

  const createdTimestamp = toTimestamp(createdAt);
  const statusChangedTimestamp = toTimestamp(statusChangedDate);

  if (createdTimestamp === undefined || statusChangedTimestamp === undefined) {
    return undefined;
  }

  return Math.max(0, (statusChangedTimestamp - createdTimestamp) / DAY_MS);
};
