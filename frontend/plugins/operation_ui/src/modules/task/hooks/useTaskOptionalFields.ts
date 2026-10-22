import { useMilestones } from '@/project/hooks/useMilestones';
import { useGetEstimateChoiceByTeam } from '@/task/hooks/useGetEstimateChoiceByTeam';
import { useGetTeam } from '@/team/hooks/useGetTeam';

/**
 * Which optional task fields apply, so a detail shows only those: cycles
 * when the team uses them, estimates when the team has estimate choices,
 * milestones when the task's project has any.
 */
export const useTaskOptionalFields = ({
  teamId,
  projectId,
}: {
  teamId?: string | null;
  projectId?: string | null;
}) => {
  const { team, loading: loadingTeam } = useGetTeam(teamId);
  const { estimateChoices, loading: loadingEstimates } =
    useGetEstimateChoiceByTeam({
      variables: { teamId: teamId || '' },
      skip: !teamId,
    });
  const { totalCount, loading: loadingMilestones } = useMilestones(projectId);

  return {
    // Still finding out; a form waits so its rows do not jump in later.
    loading: loadingTeam || loadingEstimates || loadingMilestones,
    showCycle: !!team?.cycleEnabled,
    showEstimate: !!estimateChoices?.length,
    showMilestone: !!projectId && !!totalCount,
  };
};
