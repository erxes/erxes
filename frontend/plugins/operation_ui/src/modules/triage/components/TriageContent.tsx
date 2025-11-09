import { ScrollArea, Spinner } from 'erxes-ui';
import { useGetTriage } from '@/triage/hooks/useGetTriage';
import { ITriage } from '@/triage/types/triage';
import { NoTriageSelected } from './NoTriageSelected';
import { TriageFields } from './TriageFields';
import { TaskDetailSheet } from '@/task/components/TaskDetailSheet';
import { Suspense } from 'react';
import { useParams } from 'react-router';
import { TaskSideWidgets } from '~/widgets/relation/TaskSideWidgets';

export const TriageContent = ({
  triageId: triageIdProp,
}: {
  triageId?: string;
}) => {
  const { triageId } = useParams<{ triageId: string }>();
  const triageIdToUse = triageIdProp || triageId;
  const { triage, loading } = useGetTriage({
    variables: { _id: triageIdToUse },
    skip: !triageIdToUse,
  });

  if (loading) {
    return <Spinner />;
  }

  if (!triageIdToUse || !triage) {
    return <NoTriageSelected />;
  }

  return (
    <div className="flex flex-1 overflow-hidden h-full">
      <ScrollArea className="overflow-hidden h-full flex-1">
        <TriageContentWrapper triage={triage} />
      </ScrollArea>
      <TaskSideWidgets contentId={triage._id} />
    </div>
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
