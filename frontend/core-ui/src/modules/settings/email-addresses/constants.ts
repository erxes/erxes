import {
  IconBan,
  IconCircleCheck,
  IconHelpCircle,
  IconMailExclamation,
  IconMailOff,
  IconUserOff,
} from '@tabler/icons-react';

export const EMAIL_ADDRESSES_CURSOR_SESSION_KEY = 'email-addresses-cursor';

/**
 * The three groups every address falls into. Named for what is known about the
 * address rather than for what the system does with it, because that is what a
 * person is asking when they open this list.
 */
export const EMAIL_LANE_OPTIONS = [
  { value: 'proven', label: 'Proven', icon: IconCircleCheck },
  { value: 'unknown', label: 'Unknown', icon: IconHelpCircle },
  { value: 'suppressed', label: 'Suppressed', icon: IconBan },
] as const;

export const EMAIL_SUPPRESSION_REASON_OPTIONS = [
  { value: 'hard_bounce', label: 'Hard bounce', icon: IconMailOff },
  { value: 'complaint', label: 'Spam complaint', icon: IconMailExclamation },
  { value: 'unsubscribe', label: 'Unsubscribed', icon: IconUserOff },
  { value: 'manual', label: 'Closed by hand', icon: IconBan },
] as const;
