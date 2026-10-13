import type { MissedReason } from '../../types';

export const DEFAULT_CALLBACK_WINDOW_MINUTES = 60;

export const CALLBACK_WINDOW_OPTIONS = [0, 15, 30, 60, 120, 240, 1440];

export const ALL_AGENTS = 'all';

export type SlaTranslate = (key: string, fallback: string) => string;

export function formatCallbackWindow(minutes: number, t: SlaTranslate): string {
  if (!minutes) return t('off', 'Off');
  if (minutes % 60 === 0) return `${minutes / 60} ${t('hour-short', 'h')}`;
  return `${minutes} ${t('min', 'min')}`;
}

export const MISSED_REASON_ORDER: MissedReason[] = [
  'QUEUE_ABANDON',
  'NOT_PICKED_UP',
  'IVR',
  'BUSY',
  'VOICEMAIL',
  'FAILED',
  'SHORT_HANGUP',
];

export const MISSED_REASON_META: Record<
  MissedReason,
  { key: string; label: string; hint: string; color: string }
> = {
  QUEUE_ABANDON: {
    key: 'missed-reason-queue-abandon',
    label: 'Gave up in queue',
    hint: 'Waited in the queue before any agent phone rang',
    color: 'var(--destructive)',
  },
  NOT_PICKED_UP: {
    key: 'missed-reason-not-picked-up',
    label: 'Rang, nobody answered',
    hint: 'At least one agent phone rang',
    color: 'var(--chart-1)',
  },
  IVR: {
    key: 'missed-reason-ivr',
    label: 'Left in IVR',
    hint: 'Hung up before reaching a queue or agent',
    color: 'var(--warning)',
  },
  BUSY: {
    key: 'missed-reason-busy',
    label: 'Line busy',
    hint: 'The PBX returned busy',
    color: 'var(--chart-5)',
  },
  VOICEMAIL: {
    key: 'missed-reason-voicemail',
    label: 'Went to voicemail',
    hint: 'Voicemail picked up instead of an agent',
    color: 'var(--chart-3)',
  },
  FAILED: {
    key: 'missed-reason-failed',
    label: 'Failed',
    hint: 'The PBX could not connect the call',
    color: 'var(--chart-4)',
  },
  SHORT_HANGUP: {
    key: 'missed-reason-short-hangup',
    label: 'Hung up within {{seconds}} s',
    hint: 'Not counted in the service level',
    color: 'var(--muted-foreground)',
  },
};
