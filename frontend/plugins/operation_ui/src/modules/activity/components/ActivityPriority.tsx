import { IActivity } from '@/activity/types';
import { PriorityBadge } from '@/operation/components/PriorityInline';

export const ActivityPriority = ({
  metadata,
}: {
  metadata: IActivity['metadata'];
}) => {
  const { newValue, previousValue } = metadata ?? {};

  return (
    <div className="flex items-center gap-1">
      changed
      <PriorityBadge priority={Number(previousValue)} />
      to
      <PriorityBadge priority={Number(newValue)} />
    </div>
  );
};
