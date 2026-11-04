import { IActivity } from '@/activity/types';
import { format } from 'date-fns';
import { Badge } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { useActivityListContext } from '@/activity/context/ActivityListContext';

export const ActivityDate = ({
  metadata,
  type,
}: {
  metadata: IActivity['metadata'];
  type: 'start' | 'end';
}) => {
  const { t } = useTranslation('operation');
  const contentDetail = useActivityListContext();
  const { previousValue, newValue } = metadata ?? {};
  const dateLabel =
    type === 'end' && 'assigneeId' in contentDetail
      ? t('due-date')
      : `${type === 'start' ? t('start') : t('end')} ${t('date')}`;

  return (
    <div className="inline-flex min-w-0 max-w-full flex-wrap items-center gap-x-1 gap-y-1">
      {t('changed')} {dateLabel}
      {previousValue && (
        <>
          {' '}
          <Badge
            variant="secondary"
            className="min-w-0 max-w-full [&_span]:truncate"
          >
            {format(new Date(previousValue), 'MMM d, yyyy')}
          </Badge>
        </>
      )}{' '}
      {t('to')}
      {newValue && (
        <Badge
          variant="secondary"
          className="min-w-0 max-w-full [&_span]:truncate"
        >
          {format(new Date(newValue), 'MMM d, yyyy')}
        </Badge>
      )}
    </div>
  );
};
