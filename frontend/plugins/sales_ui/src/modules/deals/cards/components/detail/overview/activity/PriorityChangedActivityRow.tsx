import { ActivityLogs, TActivityLog } from 'ui-modules/modules';
import { PriorityBadge } from '~/modules/deals/components/deal-selects/PriorityInline';
import { IDeal } from '~/modules/deals/types/deals';

const PRIORITY_OPTIONS_MAP = [
  {
    label: 'low',
    value: 0,
  },
  {
    label: 'medium',
    value: 2,
  },
  {
    label: 'high',
    value: 3,
  },
  {
    label: 'critical',
    value: 4,
  },
];

export const PriorityChangedActivityRow = (activity: TActivityLog<IDeal>) => {
  const { action, context } = activity;
  const priority = PRIORITY_OPTIONS_MAP.find(
    ({ label }) => label === context.text,
  );
  return (
    <div className="flex flex-row items-center gap-3">
      <ActivityLogs.ActorName activity={activity} />
      {action.description}
      <PriorityBadge priority={priority?.value || 0} />
    </div>
  );
};
