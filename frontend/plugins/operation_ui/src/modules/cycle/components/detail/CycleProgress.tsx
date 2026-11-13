import { ProgressSummary } from '@/operation/components/progress/ScopeProgress';
import { ICycleStatistics } from '@/cycle/types';
import { useGetCycleProgress } from '@/cycle/hooks/useGetCycleProgress';
import { useQueryState } from 'erxes-ui';

export const CycleProgress = ({
  cycleId,
  isCompleted,
  statistics,
}: {
  cycleId: string;
  isCompleted: boolean;
  statistics?: ICycleStatistics;
}) => {
  const [assignee] = useQueryState<string>('assignee');

  const { cycleProgress } = useGetCycleProgress(
    isCompleted ? undefined : cycleId,
  );

  let progress = cycleProgress || statistics?.progress;

  if (isCompleted && assignee) {
    const progressByMember = statistics?.progressByMember ?? [];

    const progressByMemberFiltered = progressByMember.find(
      (item) => item.assigneeId === assignee,
    );

    progress = progressByMemberFiltered;
  }

  return <ProgressSummary progress={progress} />;
};
