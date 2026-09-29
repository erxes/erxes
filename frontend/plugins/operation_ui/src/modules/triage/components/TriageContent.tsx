import { FocusSheet, ScrollArea, Spinner } from 'erxes-ui';
import { useGetTriage } from '@/triage/hooks/useGetTriage';
import { ITriageDetail } from '@/triage/types/triage';
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
    variables: { _id: triageIdToUse ?? '' },
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
      <FocusSheet>
        <TaskSideWidgets contentId={triage._id} />
      </FocusSheet>
    </div>
  );
};

const TriageContentWrapper = ({ triage }: { triage: ITriageDetail }) => {
  return (
    <Suspense>
      <TaskDetailSheet />

      <div className="h-full w-full flex overflow-auto">
        <div className="w-full xl:max-w-3xl mx-auto py-12 px-6">
          <TriageFields key={triage._id} triage={triage} />
        </div>
      </div>
    </Suspense>
  );
};
