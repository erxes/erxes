import { useTranslation } from 'react-i18next';
import { hasDeliveryIssue } from '@/activity/utils/hasDeliveryIssue';
import type { NoteDeliveryStatusProps } from '@/activity/types';

export const NoteDeliveryStatus = ({ delivery }: NoteDeliveryStatusProps) => {
  const { t } = useTranslation('frontline');

  if (delivery.status === 'pending') {
    return (
      <span className="rounded-full bg-muted px-2 py-px text-[10px] font-medium text-muted-foreground">
        {t('email-delivery-pending', 'Sending…')}
      </span>
    );
  }

  if (!hasDeliveryIssue(delivery)) {
    return null;
  }

  return (
    <span className="rounded-full bg-destructive/10 px-2 py-px text-[10px] font-medium text-destructive">
      {delivery.status === 'bounced'
        ? t('email-delivery-bounced', 'Bounced')
        : t('email-delivery-failed', 'Not delivered')}
    </span>
  );
};
