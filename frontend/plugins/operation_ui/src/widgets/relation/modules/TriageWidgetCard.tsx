import { ITriage } from '@/triage/types/triage';
import {
  IconCalendarEventFilled,
  IconCaretLeftRight,
} from '@tabler/icons-react';
import {
  Badge,
  Button,
  Card,
  Separator,
  Sheet,
  SheetClose,
  Spinner,
} from 'erxes-ui';
import { format } from 'date-fns';
import { MembersInline } from 'ui-modules';
import { PriorityBadge } from '@/operation/components/PriorityInline';
import { lazy, Suspense, useState } from 'react';

const TriageContent = lazy(() =>
  import('@/triage/components/TriageContent').then((module) => ({
    default: module.TriageContent,
  })),
);

export const TriageWidgetCard = ({ triage }: { triage: ITriage }) => {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <Sheet.Trigger asChild>
        <Card className="bg-background">
          <div className="px-2 h-9 flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground px-1 hover:bg-background pointer-events-none"
            >
              <MembersInline memberIds={[triage.createdBy]} /> created
            </Button>
          </div>
          <Separator />
          <div className="p-3">
            <div className="flex flex-col gap-1">
              <h5 className="font-semibold">{triage.name}</h5>
              <p className="text-sm text-accent-foreground uppercase">
                Triage #{triage.number}
              </p>
              <div className="flex flex-wrap gap-1 pt-2 pb-1">
                <Badge variant="secondary">
                  <IconCaretLeftRight className="size-4" /> Triage
                </Badge>
                <PriorityBadge priority={triage.priority} />
              </div>
            </div>
          </div>
          <Separator />
          <div className="h-9 px-2 flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground px-1 hover:bg-background pointer-events-none"
            >
              <IconCalendarEventFilled />
              Created on:{' '}
              {triage.createdAt &&
                format(new Date(triage.createdAt), 'MMM dd, yyyy')}
            </Button>
          </div>
        </Card>
      </Sheet.Trigger>
      <Sheet.View>
        <Sheet.Header>
          <Sheet.Title>{triage.name}</Sheet.Title>
          <Sheet.Close />
        </Sheet.Header>
        <Sheet.Content>
          <Suspense fallback={<Spinner containerClassName="h-full" />}>
            {open && <TriageContent triageId={triage._id} />}
          </Suspense>
        </Sheet.Content>
      </Sheet.View>
    </Sheet>
  );
};
