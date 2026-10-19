import type { DealTitleBlockProps } from '~/widgets/notifications/my-inbox/types/notificationContent';
import { useTranslation } from 'react-i18next';

export const DealTitleBlock = ({ deal }: DealTitleBlockProps) => {
  const { t } = useTranslation('sales');

  return (
    <div className="min-w-0">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {deal.number
          ? t('deal-number', 'Deal #{{number}}', { number: deal.number })
          : t('deal', 'Deal')}
      </p>
      <h2 className="mt-1 break-words text-2xl font-semibold text-foreground">
        {deal.name || t('untitled-deal', 'Untitled deal')}
      </h2>
    </div>
  );
};
