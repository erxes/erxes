import type { TNoteKind } from '@/activity/types';
import type { ReactNode } from 'react';
import {
  IconLock,
  IconMailDown,
  IconMessage2,
  IconMailUp,
  IconWorld,
} from '@tabler/icons-react';

export const NOTE_KIND_BADGES: Record<
  TNoteKind,
  { icon: ReactNode; labelKey: string; label: string }
> = {
  internal: {
    icon: <IconLock />,
    labelKey: 'internal-note',
    label: 'Internal Note',
  },
  emailReceived: {
    icon: <IconMailDown />,
    labelKey: 'note-email-received',
    label: 'Received by email',
  },
  portalReceived: {
    icon: <IconMessage2 />,
    labelKey: 'note-portal-received',
    label: 'Sent from the client portal',
  },
  emailSent: {
    icon: <IconMailUp />,
    labelKey: 'note-email-sent',
    label: 'Emailed to the customer',
  },
  customerVisible: {
    icon: <IconWorld />,
    labelKey: 'note-customer-visible',
    label: 'Visible to the customer',
  },
};
