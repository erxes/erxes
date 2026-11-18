import { useEffect, useState } from 'react';

type TSlaDates = {
  firstResponseDueAt?: string | Date | null;
  resolutionDueAt?: string | Date | null;
  firstRespondedAt?: string | Date | null;
  resolvedAt?: string | Date | null;
} | null;

export type TSlaClockState = {
  clock: 'firstResponse' | 'resolution';
  state: 'met' | 'missed' | 'running' | 'overdue';
  dueAt: Date;
  /** Minutes to the due time while running; minutes past it once overdue. */
  minutes: number;
};

const toDate = (value?: string | Date | null) =>
  value ? new Date(value) : undefined;

const MINUTE = 60_000;

const clockState = (
  clock: TSlaClockState['clock'],
  due?: string | Date | null,
  stopped?: string | Date | null,
  now = new Date(),
): TSlaClockState | null => {
  const dueAt = toDate(due);

  if (!dueAt) {
    return null;
  }

  const stoppedAt = toDate(stopped);

  if (stoppedAt) {
    return {
      clock,
      state: stoppedAt <= dueAt ? 'met' : 'missed',
      dueAt,
      minutes: 0,
    };
  }

  const left = Math.round((dueAt.getTime() - now.getTime()) / MINUTE);

  return {
    clock,
    state: left >= 0 ? 'running' : 'overdue',
    dueAt,
    minutes: Math.abs(left),
  };
};

/** The ticket's two SLA clocks, refreshed every minute while one runs. */
export const useTicketSlaStatus = (sla: TSlaDates) => {
  const [now, setNow] = useState(() => new Date());
  const running = !!sla && (!sla.firstRespondedAt || !sla.resolvedAt);

  useEffect(() => {
    if (!running) {
      return;
    }

    const timer = setInterval(() => setNow(new Date()), MINUTE);

    return () => clearInterval(timer);
  }, [running]);

  return [
    clockState('firstResponse', sla?.firstResponseDueAt, sla?.firstRespondedAt, now),
    clockState('resolution', sla?.resolutionDueAt, sla?.resolvedAt, now),
  ].filter((item): item is TSlaClockState => !!item);
};

export const formatSlaMinutes = (minutes: number) => {
  const days = Math.floor(minutes / (24 * 60));
  const hours = Math.floor((minutes % (24 * 60)) / 60);
  const rest = minutes % 60;

  return [days && `${days}d`, hours && `${hours}h`, `${rest}m`]
    .filter(Boolean)
    .join(' ');
};
