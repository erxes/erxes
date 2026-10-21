import {
  IconBan,
  IconCircleCheck,
  IconFilter,
  IconHelpCircle,
  IconMailExclamation,
  IconMailOff,
  IconUserOff,
} from '@tabler/icons-react';
import { TEmailScreenReason } from '@/settings/email-addresses/types';

export const EMAIL_ADDRESSES_CURSOR_SESSION_KEY = 'email-addresses-cursor';

export const EMAIL_LANE_OPTIONS = [
  { value: 'proven', label: 'Proven', icon: IconCircleCheck },
  { value: 'unknown', label: 'Unknown', icon: IconHelpCircle },
  { value: 'suppressed', label: 'Suppressed', icon: IconBan },
] as const;

export const EMAIL_SUPPRESSION_REASON_OPTIONS = [
  { value: 'hard_bounce', label: 'Hard bounce', icon: IconMailOff },
  { value: 'complaint', label: 'Spam complaint', icon: IconMailExclamation },
  { value: 'unsubscribe', label: 'Unsubscribed', icon: IconUserOff },
  { value: 'screened', label: 'Screened', icon: IconFilter },
  { value: 'manual', label: 'Closed by hand', icon: IconBan },
] as const;

export const EMAIL_SCREEN_REASON_LABELS: Record<TEmailScreenReason, string> = {
  syntax: 'Invalid format',
  no_mx: 'Domain has no mail server',
  disposable: 'Disposable domain',
  random: 'Looks generated',
};
