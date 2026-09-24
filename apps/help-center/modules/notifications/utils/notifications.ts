import type { IconName } from '@/modules/ui/components/Icon';
import type { PortalNotification } from '../types';

export type NotificationTarget = {
  href: string | null;
  icon: IconName;
};

const MATCHERS: {
  test: RegExp;
  href?: (id: string) => string;
  icon: IconName;
}[] = [
  { test: /submission/, icon: 'clipboard' },
  { test: /ticket/, href: (id) => `/tickets/${id}`, icon: 'ticket' },
  {
    test: /article|knowledgebase|knowledge_base/,
    href: (id) => `/knowledge-base/article/${id}`,
    icon: 'book',
  },
  { test: /post/, href: (id) => `/announcements/${id}`, icon: 'megaphone' },
  { test: /form/, href: (id) => `/forms/${id}`, icon: 'clipboard' },
  { test: /survey/, icon: 'star' },
  { test: /conversation|message/, icon: 'inbox' },
  { test: /user|customer|account/, icon: 'user' },
];

export const notificationTarget = (
  notification: PortalNotification,
): NotificationTarget => {
  const type = (notification.contentType ?? '').toLowerCase();
  const id = notification.contentTypeId ?? '';

  const matcher = MATCHERS.find((entry) => entry.test.test(type));

  if (!matcher) {
    return { href: null, icon: 'bell' };
  }

  return {
    href: id && matcher.href ? matcher.href(encodeURIComponent(id)) : null,
    icon: matcher.icon,
  };
};

const TONES: Record<string, string> = {
  success: 'bg-success-soft text-success',
  warning: 'bg-warning-soft text-warning',
  error: 'bg-danger-soft text-danger',
};

export const notificationTone = (notification: PortalNotification): string =>
  TONES[(notification.type ?? '').toLowerCase()] ?? 'bg-brand-soft text-brand';

const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

export const relativeTime = (value: string | null): string => {
  if (!value) {
    return '';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return '';
  }

  const elapsed = Date.now() - date.getTime();

  if (elapsed < MINUTE) {
    return 'Just now';
  }

  if (elapsed < HOUR) {
    return `${Math.floor(elapsed / MINUTE)} min ago`;
  }

  if (elapsed < DAY) {
    const hours = Math.floor(elapsed / HOUR);

    return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
  }

  if (elapsed < 7 * DAY) {
    const days = Math.floor(elapsed / DAY);

    return `${days} ${days === 1 ? 'day' : 'days'} ago`;
  }

  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};
