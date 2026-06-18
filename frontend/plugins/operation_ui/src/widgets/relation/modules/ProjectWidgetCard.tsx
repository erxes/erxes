import { PriorityBadge } from '@/operation/components/PriorityInline';
import {
  StatusInlineIcon,
  StatusInlineLabel,
} from '@/operation/components/StatusInline';
import { IProject } from '@/project/types';
import {
  IconCalendarEventFilled,
  IconClipboard,
} from '@tabler/icons-react';
import { Badge, Button, Card, Separator, Sheet, Spinner } from 'erxes-ui';
import { format } from 'date-fns';
import { MembersInline } from 'ui-modules';
import { lazy, Suspense, useState } from 'react';

const ProjectDetails = lazy(() =>
  import('@/project/components/details/ProjectDetails').then((module) => ({
    default: module.ProjectDetails,
  })),
);

export const ProjectWidgetCard = ({ project }: { project: IProject }) => {
  const [open, setOpen] = useState(false);

  const { _id, name, status, priority, targetDate, leadId, createdAt } =
    project;

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <Sheet.Trigger asChild>
        <Card className="bg-background cursor-pointer">
          <div className="px-2 h-9 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <IconClipboard className="size-4 text-muted-foreground" />
              <Badge variant="secondary" className="gap-1">
                <StatusInlineIcon statusType={status} />
                <StatusInlineLabel statusType={status} />
              </Badge>
            </div>
            {leadId && (
              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground px-1 hover:bg-background pointer-events-none"
              >
                <MembersInline memberIds={[leadId]} />
              </Button>
            )}
          </div>
          <Separator />
          <div className="p-3">
            <div className="flex flex-col gap-1">
              <h5 className="font-semibold">{name}</h5>
            </div>
            <div className="flex flex-wrap gap-1 pt-2 pb-1">
              <PriorityBadge priority={priority} />
            </div>
          </div>
          <Separator />
          <div className="h-9 px-2 flex items-center">
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground px-1 hover:bg-background pointer-events-none"
            >
              <IconCalendarEventFilled />
              {targetDate
                ? `Due: ${format(new Date(targetDate), 'MMM dd, yyyy')}`
                : `Created: ${format(new Date(createdAt), 'MMM dd, yyyy')}`}
            </Button>
          </div>
        </Card>
      </Sheet.Trigger>
      <Sheet.View>
        <Sheet.Header>
          <Sheet.Title>{name}</Sheet.Title>
          <Sheet.Close />
        </Sheet.Header>
        <Sheet.Content>
          <Suspense fallback={<Spinner containerClassName="h-full" />}>
            {open && <ProjectDetails projectId={_id} />}
          </Suspense>
        </Sheet.Content>
      </Sheet.View>
    </Sheet>
  );
};
