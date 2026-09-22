import { IActivity } from '@/activity/types';
import { Badge } from 'erxes-ui';
import { MembersInline } from 'ui-modules';
import { useTranslation } from 'react-i18next';

export const ActivityLead = ({
  metadata,
}: {
  metadata: IActivity['metadata'];
}) => {
  const { t } = useTranslation('operation');
  const { previousValue, newValue } = metadata;

  return (
    <div className="inline-flex items-center gap-1">
      {t('changed-lead')}{' '}
      {previousValue && (
        <>
          {t('from')}
          <Badge variant="secondary" className="flex-none">
            <MembersInline memberIds={[previousValue]} />
          </Badge>
        </>
      )}
      {t('to')}
      {newValue && (
        <Badge variant="secondary" className="flex-none">
          <MembersInline memberIds={[newValue]} />
        </Badge>
      )}
    </div>
  );
};
