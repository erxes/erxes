import { AddTriageSheet } from '@/triage/components/add-triage/AddTriageSheet';
import { useRelations } from '../hooks/useRelations';
import { TaskDetail } from './TaskDetail';
import { Spinner } from 'erxes-ui';
import { useCreateRelation } from '../hooks/useCreateRelation';
import { RelationsCard } from './RelationsCard';

export const Task = ({
  contentId,
  contentType,
}: {
  contentId: string;
  contentType: string;
}) => {
  const { ownEntities, loading } = useRelations({
    contentId,
    contentType,
  });
  const { createRelation } = useCreateRelation();

  if (loading) {
    return <Spinner containerClassName="py-20" />;
  }

  if (ownEntities?.length === 0) {
    const onComplete = (triageId: string) => {
      createRelation({
        entities: [
          {
            contentType,
            contentId,
          },
          {
            contentType: 'operation:task',
            contentId: triageId,
          },
        ],
      });
    };

    return <AddTriageSheet onComplete={onComplete} />;
  }

  return ownEntities?.map((entity) => (
    <RelationsCard key={entity.contentId}>
      <TaskDetail key={entity.contentId} taskId={entity.contentId} />
    </RelationsCard>
  ));
};
