import { ScrollArea, Spinner } from 'erxes-ui';
import { useGetTriage } from '@/triage/hooks/useGetTriage';
import { ITriage } from '@/triage/types/triage';
import { NoTriageSelected } from './NoTriageSelected';
import { TriageFields } from './TriageFields';
import { TaskDetailSheet } from '@/task/components/TaskDetailSheet';
import { Suspense } from 'react';

export const TriageContent = () => {
  const { triage, loading } = useGetTriage();

  if (loading) {
    return <Spinner />;
  }

  if (!triage) {
    return <NoTriageSelected />;
  }

  return (
    <ScrollArea className="overflow-hidden h-full">
      <TriageContentWrapper triage={triage} />
    </ScrollArea>
  );
};

const TriageContentWrapper = ({ triage }: { triage: ITriage }) => {
  return (
    <Suspense>
      <TaskDetailSheet />
      <div className="h-full w-full flex overflow-auto">
        <div className="w-full xl:max-w-3xl mx-auto py-12 px-6">
          <TriageFields triage={triage} />
        </div>
      </div>
    </Suspense>
  );
};
