import { IActivity } from '@/activity/types';
import { PriorityBadge } from '@/operation/components/PriorityInline';
import { useTranslation } from 'react-i18next';

export const ActivityPriority = ({
  metadata,
}: {
  metadata: IActivity['metadata'];
}) => {
  const { t } = useTranslation('operation');
  const { newValue, previousValue } = metadata ?? {};

  return (
    <div className="flex min-w-0 max-w-full flex-wrap items-center gap-x-1 gap-y-1">
      {t('changed')}
      <PriorityBadge priority={Number(previousValue)} />
      {t('to')}
      <PriorityBadge priority={Number(newValue)} />
    </div>
  );
};
