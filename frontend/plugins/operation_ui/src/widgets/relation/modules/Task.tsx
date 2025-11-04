import { AddTriageSheet } from '@/triage/components/add-triage/AddTriageSheet';
import { useRelations } from 'ui-modules';
import { TaskWidget } from './TaskWidget';
import { ScrollArea, Separator, Spinner } from 'erxes-ui';
import { IconCaretLeftRight } from '@tabler/icons-react';

import { useCreateMultipleRelations } from 'ui-modules';

export const Task = ({
  contentId,
  contentType,
  customerId,
  companyId,
}: {
  contentId: string;
  contentType: string;
  customerId?: string;
  companyId?: string;
}) => {
  const { ownEntities, loading: loadingRelations } = useRelations({
    contentId,
    contentType,
  });

  const { createMultipleRelations } = useCreateMultipleRelations();

  if (loadingRelations) {
    return <Spinner containerClassName="py-20" />;
  }

  const onComplete = (triageId: string) => {
    const createRelation = (ct: string, cid: string) => ({
      entities: [
        { contentType: ct, contentId: cid },
        { contentType: 'operation:task', contentId: triageId },
      ],
    });

    const relations = [
      createRelation(contentType, contentId),
      ...(customerId ? [createRelation('core:customer', customerId)] : []),
      ...(companyId ? [createRelation('core:company', companyId)] : []),
    ];

    createMultipleRelations(relations);
  };

  if (ownEntities?.length === 0) {
    return (
      <div className="flex flex-auto flex-col gap-4 justify-center items-center text-muted-foreground">
        <div className="border border-dashed p-6 bg-background rounded-xl">
          <IconCaretLeftRight />
        </div>
        <span className="text-sm">No triages to display at the moment.</span>
        <AddTriageSheet onComplete={onComplete} />
      </div>
    );
  }

  return (
    <>
      <div className="h-11 px-4 flex items-center gap-2 flex-none bg-background justify-between">
        <span className="font-medium text-primary">Tasks and Triages</span>
        <AddTriageSheet onComplete={onComplete} />
      </div>
      <Separator />
      <ScrollArea className="flex-auto">
        <div className="flex flex-col gap-4 p-4">
          {ownEntities?.map((entity) => (
            <TaskWidget key={entity.contentId} taskId={entity.contentId} />
          ))}
        </div>
      </ScrollArea>
    </>
  );
};
