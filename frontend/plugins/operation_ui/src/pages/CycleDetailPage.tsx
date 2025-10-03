import { useParams } from 'react-router-dom';
import { CycleDetailHeader } from '@/cycle/components/detail/CycleDetailHeader';
import { TasksLayout } from '@/task/components/TasksLayout';
import { CycleSideWidget } from '@/cycle/components/detail/CycleSideWidget';

export const CycleDetailPage = () => {
  const { cycleId } = useParams();

  if (!cycleId) return null;

  return (
    <>
      <CycleDetailHeader />
      <div className="flex overflow-hidden w-full h-full">
        <TasksLayout />
        <CycleSideWidget cycleId={cycleId} />
      </div>
    </>
  );
};
