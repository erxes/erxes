import { TasksLayout } from '@/task/components/TasksLayout';
import { CycleSideWidget } from '@/cycle/components/detail/CycleSideWidget';
import { useParams } from 'react-router-dom';

export const CycleDetail = () => {
  const { cycleId } = useParams<{
    cycleId: string;
  }>();

  return (
    <>
      <CycleSideWidget cycleId={cycleId || ''} />
      <TasksLayout />
    </>
  );
};
