import { IActivity } from '@/activity/types';
import { Badge } from 'erxes-ui';
import { MembersInline } from 'ui-modules';

export const ActivityAssignee = ({
  metadata,
}: {
  metadata: IActivity['metadata'];
}) => {
  const { previousValue, newValue } = metadata;

  return (
    <div className="inline-flex items-center gap-1">
      changed assignee{' '}
      {!!previousValue && (
        <>
          from
          <Badge variant="secondary" className="flex-none">
            <MembersInline memberIds={previousValue ? [previousValue] : []} />
          </Badge>
        </>
      )}
      to
      <Badge variant="secondary" className="flex-none">
        <MembersInline memberIds={newValue ? [newValue] : []} />
      </Badge>
    </div>
  );
};
