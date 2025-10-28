import { AddTriageSheet } from '@/triage/components/add-triage/AddTriageSheet';
import { useRelations } from '../hooks/useRelations';
import { TaskWidget } from './TaskWidget';
import { ScrollArea, Spinner } from 'erxes-ui';
import { useCreateRelation } from '../hooks/useCreateRelation';

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

  return (
    <ScrollArea className="h-full flex-auto">
      <div className="flex flex-col gap-4 p-4">
        {ownEntities?.map((entity) => (
          <TaskWidget key={entity.contentId} taskId={entity.contentId} />
        ))}
      </div>
    </ScrollArea>
  );
};
