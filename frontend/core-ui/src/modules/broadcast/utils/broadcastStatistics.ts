import {
  IconBan,
  IconBounceRightFilled,
  IconClockPause,
  IconBrandTelegram,
  IconClick,
  IconMail,
  IconMailCheck,
  IconMailOpened,
  IconMoodSad,
  IconXboxXFilled,
} from '@tabler/icons-react';
import type { TablerIcon } from '@tabler/icons-react';
import {
  BROADCAST_NOTIFICATION_STATISTIC,
  BROADCAST_WORKFLOW_STATISTIC,
} from '../constants';
import { TBroadcastMessage } from '../types';

export type TBroadcastStatisticConfig = Record<
  string,
  { titleKey: string; descriptionKey: string; icon: TablerIcon }
>;

/**
 * Named after whoever is actually carrying the mail: these figures come from
 * the provider, and an SES explanation on a SendGrid account is simply wrong.
 * The provider fills the `{{provider}}` in the descriptions.
 */
export const EMAIL_STATISTIC: TBroadcastStatisticConfig = {
  total: {
    titleKey: 'stat.email.total',
    descriptionKey: 'stat.email.total-body',
    icon: IconMail,
  },
  send: {
    titleKey: 'stat.email.send',
    descriptionKey: 'stat.email.send-body',
    icon: IconBrandTelegram,
  },
  delivery: {
    titleKey: 'stat.email.delivery',
    descriptionKey: 'stat.email.delivery-body',
    icon: IconMailCheck,
  },
  open: {
    titleKey: 'stat.email.open',
    descriptionKey: 'stat.email.open-body',
    icon: IconMailOpened,
  },
  click: {
    titleKey: 'stat.email.click',
    descriptionKey: 'stat.email.click-body',
    icon: IconClick,
  },
  complaint: {
    titleKey: 'stat.email.complaint',
    descriptionKey: 'stat.email.complaint-body',
    icon: IconMoodSad,
  },
  bounce: {
    titleKey: 'stat.email.bounce',
    descriptionKey: 'stat.email.bounce-body',
    icon: IconBounceRightFilled,
  },
  renderingfailure: {
    titleKey: 'stat.email.renderingfailure',
    descriptionKey: 'stat.email.renderingfailure-body',
    icon: IconXboxXFilled,
  },
  reject: {
    titleKey: 'stat.email.reject',
    descriptionKey: 'stat.email.reject-body',
    icon: IconBan,
  },
  deferred: {
    titleKey: 'stat.email.deferred',
    descriptionKey: 'stat.email.deferred-body',
    icon: IconClockPause,
  },
};

const buildWorkflowStats = (message: TBroadcastMessage) => {
  const { totalCustomersCount = 0, validCustomersCount = 0 } = message;

  return { total: totalCustomersCount, started: validCustomersCount };
};

const buildNotificationStats = (message: TBroadcastMessage) => {
  const {
    totalCustomersCount = 0,
    validCustomersCount = 0,
    stats,
    notification,
  } = message;

  return {
    total: totalCustomersCount,
    sent: validCustomersCount,
    read: stats?.read || 0,
    push: notification?.isMobile ? 1 : 0,
  };
};

export const STATISTIC_BUILDERS: Record<
  string,
  {
    config: TBroadcastStatisticConfig;
    build: (message: TBroadcastMessage) => Record<string, number>;
  }
> = {
  notification: {
    config: BROADCAST_NOTIFICATION_STATISTIC,
    build: buildNotificationStats,
  },
  workflow: {
    config: BROADCAST_WORKFLOW_STATISTIC,
    build: buildWorkflowStats,
  },
};

/**
 * What the run decided against. Every method writes a manifest now, so the
 * difference between "targeted" and "sent" has an answer — without this box a
 * campaign that reached two thirds of its audience looks the same as one that
 * reached all of it.
 */
export const SKIPPED_STATISTIC: TBroadcastStatisticConfig = {
  skipped: {
    titleKey: 'stat.skipped',
    descriptionKey: 'stat.skipped-body',
    icon: IconBan,
  },
};

/** A figure's share of the total, as the badge beside it reads. */
export const statisticShare = (
  key: string,
  value: number,
  total: number,
  t: (key: string) => string,
): string => {
  // Push is a yes or no, not a count of anyone.
  if (key === 'push') {
    return t(value > 0 ? 'stat.yes' : 'stat.no');
  }

  if (!total) {
    return '-';
  }

  const percentage = Math.min((value * 100) / total, 100);

  return `${
    Number.isInteger(percentage) ? percentage : percentage.toFixed(2)
  }%`;
};
