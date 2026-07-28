export type NormalizedCallDirection = 'incoming' | 'outgoing';

export type NormalizedCallStatus =
  | 'answered'
  | 'missed'
  | 'voicemail'
  | 'busy'
  | 'failed'
  | 'no-answer'
  | 'ivr';

export interface IParsedCallContent {
  direction: NormalizedCallDirection;
  status?: NormalizedCallStatus;
}

export const normalizeCallDirection = (
  value?: string | null,
): NormalizedCallDirection | null => {
  const normalized = (value || '').toLowerCase();
  if (normalized === 'incoming' || normalized === 'inbound') return 'incoming';
  if (normalized === 'outgoing' || normalized === 'outbound') return 'outgoing';
  return null;
};

export const normalizeCallStatus = (
  value?: string | null,
): NormalizedCallStatus | null => {
  switch ((value || '').toUpperCase()) {
    case 'ANSWERED':
    case 'CONNECTED':
    case 'ACTIVE':
    case 'ENDED':
      return 'answered';
    case 'MISSED':
    case 'CANCELLED':
      return 'missed';
    case 'VOICEMAIL':
      return 'voicemail';
    case 'BUSY':
      return 'busy';
    case 'FAILED':
      return 'failed';
    case 'NO ANSWER':
      return 'no-answer';
    case 'IVR':
      return 'ivr';
    default:
      return null;
  }
};

export const CALL_STATUS_LABEL_KEYS: Record<NormalizedCallStatus, string> = {
  answered: 'answered',
  missed: 'missed',
  voicemail: 'voicemail',
  busy: 'busy',
  failed: 'call-failed',
  'no-answer': 'no-answer',
  ivr: 'ivr',
};

export const NOT_ANSWERED_STATUSES: NormalizedCallStatus[] = [
  'missed',
  'busy',
  'failed',
  'no-answer',
];

export const parseCallConversationContent = (
  content?: string | null,
): IParsedCallContent | null => {
  if (!content) return null;
  const trimmed = content.trim();

  if (trimmed.includes('callDirection/')) {
    const direction =
      trimmed.split('callDirection/')[1] === 'INCOMING'
        ? 'incoming'
        : 'outgoing';
    return { direction };
  }

  const separated = trimmed.split('·').map((part) => part.trim());
  if (separated.length === 2) {
    const status = normalizeCallStatus(separated[0]);
    const direction = normalizeCallDirection(separated[1]);
    if (direction) {
      return { direction, status: status || undefined };
    }
    return null;
  }

  const direction = normalizeCallDirection(trimmed);
  if (direction) return { direction };

  return null;
};
