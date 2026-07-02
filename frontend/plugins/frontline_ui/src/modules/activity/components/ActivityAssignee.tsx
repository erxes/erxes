import { IActivity } from '@/activity/types';
import { Badge } from 'erxes-ui';
import { MembersInline } from 'ui-modules';
import { useTranslation } from 'react-i18next';

export const ActivityAssignee = ({
  metadata,
}: {
  metadata: IActivity['metadata'];
}) => {
  const { t } = useTranslation('frontline');
  const { previousValue, newValue } = metadata;

  return (
    <div className="inline-flex items-center gap-1">
      {t('changed-assignee')}{' '}
      {!!previousValue && (
        <>
          {t('from')}
          <Badge variant="secondary" className="flex-none">
            <MembersInline memberIds={previousValue ? [previousValue] : []} />
          </Badge>
        </>
      )}
      {t('to')}
      <Badge variant="secondary" className="flex-none">
        <MembersInline memberIds={newValue ? [newValue] : []} />
      </Badge>
    </div>
  );
};
