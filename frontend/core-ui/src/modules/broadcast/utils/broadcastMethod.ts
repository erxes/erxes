import {
  IconArrowsSplit2,
  IconBellRinging,
  IconBrandMessenger,
  IconInfoSquareRounded,
  IconMail,
  IconMessage2,
  TablerIcon,
} from '@tabler/icons-react';
import { BROADCAST_METHODS } from '../constants';

/**
 * How each method is shown, wherever a campaign is listed.
 *
 * The table and the grid each used to carry their own version of this, and
 * they had already drifted: an SMS campaign read as "Sms" in one and "Unknown"
 * in the other.
 *
 * Methods no longer offered are kept here on purpose. They cannot be created
 * any more, but campaigns made with them are still in the list and still have
 * to say what they are.
 */
const BROADCAST_METHOD_DISPLAY: Record<
  string,
  { Icon: TablerIcon; labelKey: string }
> = {
  [BROADCAST_METHODS.EMAIL]: { Icon: IconMail, labelKey: 'method.email' },
  [BROADCAST_METHODS.SMS]: { Icon: IconMessage2, labelKey: 'method.sms' },
  [BROADCAST_METHODS.MESSENGER]: {
    Icon: IconBrandMessenger,
    labelKey: 'method.messenger',
  },
  [BROADCAST_METHODS.NOTIFICATION]: {
    Icon: IconBellRinging,
    labelKey: 'method.notification',
  },
  [BROADCAST_METHODS.WORKFLOW]: { Icon: IconArrowsSplit2, labelKey: 'method.workflow' },
};

export const broadcastMethodDisplay = (method?: string) =>
  BROADCAST_METHOD_DISPLAY[method || ''] ?? {
    Icon: IconInfoSquareRounded,
    labelKey: 'method.unknown',
  };
