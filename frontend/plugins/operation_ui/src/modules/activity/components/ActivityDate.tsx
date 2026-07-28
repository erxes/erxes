import { IActivity } from '@/activity/types';
import { format } from 'date-fns';
import { Badge } from 'erxes-ui';
import { useTranslation } from 'react-i18next';

export const ActivityDate = ({
  metadata,
  type,
}: {
  metadata: IActivity['metadata'];
  type: 'start' | 'end';
}) => {
  const { t } = useTranslation('operation');
  const { previousValue, newValue } = metadata;

  return (
    <div className="inline-flex items-center gap-1 whitespace-nowrap">
      {t('changed')} {type === 'start' ? t('start') : t('end')} {t('date')}
      {previousValue && (
        <>
          {' '}
          <Badge variant="secondary" className="flex-none">
            {format(new Date(previousValue), 'MMM d, yyyy')}
          </Badge>
        </>
      )}{' '}
      {t('to')}
      <Badge variant="secondary" className="flex-none">
        {format(new Date(newValue), 'MMM d, yyyy')}
      </Badge>
    </div>
  );
};
