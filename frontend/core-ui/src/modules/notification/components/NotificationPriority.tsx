import { NOTIFICATION_PRIORITIES } from '@/notification/constants/notifications';
import type { NotificationPriorityProps } from '@/notification/types/myInbox';
import { cn } from 'erxes-ui';
import { useTranslation } from 'react-i18next';

export const NotificationPriority = ({
  priority,
}: NotificationPriorityProps) => {
  const { t } = useTranslation('common', { keyPrefix: 'notification' });
  const index = NOTIFICATION_PRIORITIES.findIndex(
    (option) => option.value === priority,
  );
  const option = NOTIFICATION_PRIORITIES[index];

  return (
    <span className="inline-flex items-center gap-1.5">
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={3}
        strokeLinecap="round"
        className={cn('size-4 shrink-0', option?.color)}
        aria-hidden="true"
      >
        {[3, 6, 9, 12].map((height, barIndex) => (
          <path
            key={height}
            d={`M${6 + barIndex * 4} 18v-${height}`}
            className={barIndex <= index ? 'stroke-current' : 'stroke-scroll'}
          />
        ))}
      </svg>
      <span className={cn(!option && 'text-muted-foreground')}>
        {option
          ? t(option.translationKey, option.label)
          : t('no-priority', 'No priority')}
      </span>
    </span>
  );
};
