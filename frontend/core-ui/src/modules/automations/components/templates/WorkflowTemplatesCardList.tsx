import { WorkflowTemplateCard } from '@/automations/components/templates/WorkflowTemplateCard';
import { TWorkflowTemplate } from '@/automations/hooks/useWorkflowTemplateList';
import { Card, ScrollArea, Skeleton } from 'erxes-ui';

const SKELETON_COUNT = 8;

const WorkflowTemplateCardSkeleton = () => (
  <Card className="flex flex-col gap-3 border p-4">
    <Skeleton className="h-4 w-2/3" />
    <Skeleton className="h-[3.25rem] w-full" />
    <Skeleton className="h-3 w-1/3" />
  </Card>
);

// The templates query returns the full list in one response, so there is no
// cursor page to fetch on scroll here.
export const WorkflowTemplatesCardList = ({
  templates,
  loading,
  onRemove,
}: {
  templates: TWorkflowTemplate[];
  loading: boolean;
  onRemove: (templateId: string) => void;
}) => (
  <ScrollArea.Root className="h-full w-full">
    <ScrollArea.Viewport>
      <div className="grid grid-cols-[repeat(auto-fill,minmax(18rem,1fr))] gap-3 p-3">
        {templates.map((template) => (
          <WorkflowTemplateCard
            key={template._id}
            template={template}
            onRemove={onRemove}
          />
        ))}
        {loading &&
          Array.from({ length: SKELETON_COUNT }).map((_, index) => (
            <WorkflowTemplateCardSkeleton key={index} />
          ))}
      </div>
    </ScrollArea.Viewport>
    <ScrollArea.Bar orientation="vertical" />
  </ScrollArea.Root>
);
