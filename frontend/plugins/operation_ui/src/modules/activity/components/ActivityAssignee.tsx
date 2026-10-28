import { IActivity } from '@/activity/types';
import { Badge } from 'erxes-ui';
import { MembersInline } from 'ui-modules';
import { useTranslation } from 'react-i18next';

export const ActivityAssignee = ({
  metadata,
}: {
  metadata: IActivity['metadata'];
}) => {
  const { t } = useTranslation('operation');
  const { previousValue, newValue } = metadata ?? {};

  return (
    <div className="inline-flex min-w-0 max-w-full flex-wrap items-center gap-x-1 gap-y-1">
      {t('changed-assignee')}{' '}
      {!!previousValue && (
        <>
          {t('from')}
          <Badge
            variant="secondary"
            className="min-w-0 max-w-full [&_span]:truncate"
          >
            <MembersInline memberIds={previousValue ? [previousValue] : []} />
          </Badge>
        </>
      )}
      {t('to')}
      <Badge
        variant="secondary"
        className="min-w-0 max-w-full [&_span]:truncate"
      >
        <MembersInline memberIds={newValue ? [newValue] : []} />
      </Badge>
    </div>
  );
};
