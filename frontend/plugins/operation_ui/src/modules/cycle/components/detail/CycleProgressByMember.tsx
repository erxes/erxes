import { useTranslation } from 'react-i18next';
import { Button, HoverCard, useQueryState } from 'erxes-ui';
import { MembersInline } from 'ui-modules';

import { useGetCycleProgressByMember } from '@/cycle/hooks/useGetCycleProgressByMember';
import { ICycleStatistics } from '@/cycle/types';
import {
  ProgressBreakdownDetails,
  ProgressPercentLabel,
  ProgressRing,
  getScopeProgressPercent,
} from '@/operation/components/progress/ScopeProgress';

export const CycleProgressByMember = ({
  cycleId,
  isCompleted,
  statistics,
}: {
  cycleId: string;
  isCompleted: boolean;
  statistics?: ICycleStatistics;
}) => {
  const { t } = useTranslation('operation');
  const [assignee, setAssignee] = useQueryState<string | null>('assignee');

  const { cycleProgressByMember } = useGetCycleProgressByMember(
    isCompleted ? undefined : cycleId,
  );

  let progress = cycleProgressByMember || statistics?.progressByMember;

  if (isCompleted && assignee) {
    progress = progress?.filter((item) => item.assigneeId === assignee);
  }

  return (
    <div className="space-y-1">
      {progress?.map((item) => (
        <HoverCard
          openDelay={150}
          closeDelay={150}
          key={item.assigneeId ?? 'unassigned'}
        >
          <HoverCard.Trigger asChild>
            <div className="flex justify-start items-center gap-2 text-sm font-normal py-1">
              <Button
                className="p-0 truncate max-w-[170px]"
                variant="ghost"
                onClick={() => {
                  setAssignee(
                    assignee === item.assigneeId ? null : item.assigneeId,
                  );
                }}
              >
                <MembersInline
                  memberIds={item.assigneeId ? [item.assigneeId] : []}
                  placeholder={t('no-assignee')}
                />
              </Button>
              <ProgressRing value={getScopeProgressPercent(item)} />
              <ProgressPercentLabel item={item} />
            </div>
          </HoverCard.Trigger>
          <ProgressBreakdownDetails item={item} />
        </HoverCard>
      ))}
    </div>
  );
};
