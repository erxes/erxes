import { IActivity } from '@/activity/types';
import { Badge } from 'erxes-ui';
import { MembersInline } from 'ui-modules';

export const ActivityLead = ({
  metadata,
}: {
  metadata: IActivity['metadata'];
}) => {
  const { previousValue, newValue } = metadata;

  return (
    <div className="inline-flex items-center gap-1">
      changed lead{' '}
      {previousValue && (
        <>
          from
          <Badge variant="secondary" className="flex-none">
            <MembersInline memberIds={[previousValue]} />
          </Badge>
        </>
      )}
      to
      {newValue && (
        <Badge variant="secondary" className="flex-none">
          <MembersInline memberIds={[newValue]} />
        </Badge>
      )}
    </div>
  );
};
