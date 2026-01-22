import { ActivityLogs, IUser, MembersInline, TActivityLog } from 'ui-modules';
import { IDeal } from '@/deals/types/deals';

export const AssigneeActivityRow = (activity: TActivityLog<IDeal, IUser[]>) => {
  const { context, action } = activity;
  const { data: users = [] } = context || {};

  return (
    <div className="flex flex-row items-center gap-3">
      <ActivityLogs.ActorName activity={activity} />
      {action.description}
      <MembersInline
        memberIds={
          users.length
            ? users.filter(({ _id }) => _id).map((user) => user._id)
            : []
        }
        placeholder="Unnamed user"
      />
    </div>
  );
};
