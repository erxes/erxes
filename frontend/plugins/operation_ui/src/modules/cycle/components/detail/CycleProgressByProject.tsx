import CycleProjectDetail from '@/cycle/components/detail/CycleProjectDetail';
import { useGetCycleProgressByProject } from '@/cycle/hooks/useGetCycleProgressByProject';
import { ICycleProgressByProject, ICycleStatistics } from '@/cycle/types';
import { ProgressBreakdownRow } from '@/operation/components/progress/ScopeProgress';

export const CycleProgressByProjectList = ({
  items,
}: {
  items: ICycleProgressByProject[];
}) => (
  <div>
    {items.map((item) => (
      <ProgressBreakdownRow
        key={item.projectId ?? 'unassigned'}
        item={item}
        ringClassName="ml-auto"
        label={
          <CycleProjectDetail progress={items} projectId={item.projectId} />
        }
      />
    ))}
  </div>
);

export const CycleProgressByProject = ({
  cycleId,
  isCompleted,
  statistics,
}: {
  cycleId: string;
  isCompleted: boolean;
  statistics?: ICycleStatistics;
}) => {
  const { cycleProgressByProject } = useGetCycleProgressByProject(
    isCompleted ? undefined : cycleId,
  );

  const progress = cycleProgressByProject || statistics?.progressByProject;

  if (!progress) {
    return null;
  }

  return <CycleProgressByProjectList items={progress} />;
};
