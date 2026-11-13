import { ProgressSummary } from '@/operation/components/progress/ScopeProgress';
import { useGetProjectProgress } from '@/project/hooks/useGetProjectProgress';

export const Progress = ({ projectId }: { projectId: string }) => {
  const { projectProgress } = useGetProjectProgress(projectId);

  return <ProgressSummary progress={projectProgress} />;
};
