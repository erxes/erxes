import {
  type Icon,
  IconPlus,
  IconReload,
  IconCircle,
  IconCircleDot,
  IconCircleDashed,
  IconCircleCheck,
  IconCircleDashedCheck,
  IconCircleX,
  IconCopy,
} from '@tabler/icons-react';
import {
  Button,
  Dialog,
  Form,
  Input,
  Spinner,
  toast,
  InfoCard,
  Label,
  Textarea,
  cn,
  Card,
  Tooltip,
} from 'erxes-ui';
import { useCallback, useEffect, useState } from 'react';
import { useTicketProgressForms } from '../hooks/useTicketProgressForms';
import { ITicketStatus, TTicketCheckProgressForm } from '../types';
import { useGetTicketProgress } from '../hooks/useGetTicketProgress';
import { SubmitHandler } from 'react-hook-form';
import { useAtom, useAtomValue } from 'jotai';
import { ticketProgressAtom, userTicketCreatedNumberAtom } from '../../states';
import { format } from 'date-fns';

export const TicketCheckProgress = ({
  setPage,
}: {
  setPage: (page: 'submissions' | 'submit' | 'progress') => void;
}) => {
  const ticketProgress = useAtomValue(ticketProgressAtom);
  const [userTicketCreatedNumber, setUserTicketCreatedNumber] = useAtom(
    userTicketCreatedNumberAtom,
  );

  useEffect(() => {
    if (userTicketCreatedNumber) {
      setTimeout(() => {
        setUserTicketCreatedNumber(null);
      }, 10000);
    }
  }, [userTicketCreatedNumber]);
  return (
    <div className="w-full h-full flex flex-col gap-3 p-3">
      <div className="flex flex-col gap-2 flex-1 w-full h-full overflow-y-auto styled-scroll">
        {ticketProgress && (
          <InfoCard title={ticketProgress.number} className="flex-1">
            <InfoCard.Content>
              <div>
                <Label htmlFor="name">Name</Label>
                <Input id="name" readOnly value={ticketProgress.name} />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  readOnly
                  rows={3}
                  value={(() => {
                    try {
                      const parsed = JSON.parse(ticketProgress.description);
                      return parsed?.[0]?.content?.[0]?.text || '';
                    } catch {
                      return ticketProgress.description || '';
                    }
                  })()}
                />
              </div>
              <div>
                <Label htmlFor="createdAt">Created At</Label>
                <Input
                  id="createdAt"
                  readOnly
                  value={format(
                    new Date(ticketProgress.createdAt),
                    'yyyy/MM/dd',
                  )}
                />
              </div>
              <div>
                <Label htmlFor="status">Status</Label>
                <div className="flex items-center gap-2 rounded-sm p-1 shadow-xs">
                  <TicketStatusInlineValue status={ticketProgress.status} />

                  <p className="font-medium text-sm capitalize">
                    {ticketProgress.status.name}
                  </p>
                </div>
              </div>
            </InfoCard.Content>
          </InfoCard>
        )}
        <div className="grid grid-cols-2 shrink w-full flex-none">
          <div className="p-1 w-full">
            <TicketSubmissionProgress />
          </div>
          <div className="p-1 w-full">
            <Button
              type="button"
              className="bg-primary flex-none shadow-2xs w-full"
              onClick={() => setPage('submit')}
            >
              <IconPlus size={16} />
              Issue new ticket
            </Button>
          </div>
        </div>
        {userTicketCreatedNumber && (
          <div className="flex flex-col p-1">
            <Card>
              <Card.Header>
                <Card.Title>Ticket Number</Card.Title>
                <Card.Description>
                  <div className="flex items-center gap-2">
                    <Input
                      id="userTicketCreatedNumber"
                      readOnly
                      value={userTicketCreatedNumber}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => {
                        navigator.clipboard.writeText(userTicketCreatedNumber);
                        toast({
                          title: 'Copied to clipboard',
                          variant: 'success',
                        });
                      }}
                    >
                      <IconCopy size={16} />
                    </Button>
                  </div>
                </Card.Description>
              </Card.Header>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export const TicketSubmissionProgress = () => {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <Button
          type="button"
          variant="outline"
          className="flex-none shadow-2xs w-full"
        >
          <IconReload size={16} />
          Check progress
        </Button>
      </Dialog.Trigger>
      <Dialog.Content className="max-w-xs rounded-lg">
        <Dialog.HeaderCombined
          title="Check progress"
          description="Check the progress of your ticket"
        />
        <div className="flex flex-col gap-2">
          <TicketProgressForm setOpen={setOpen} />
        </div>
      </Dialog.Content>
    </Dialog>
  );
};

export const TicketProgressForm = ({
  setOpen,
}: {
  setOpen: (value: boolean) => void;
}) => {
  const { method } = useTicketProgressForms();
  const { fetchTicketProgress, loading } = useGetTicketProgress();

  const onSubmit: SubmitHandler<TTicketCheckProgressForm> = useCallback(
    async (data) => {
      try {
        await fetchTicketProgress(data.number);
        setOpen(false);
      } catch (error) {
        toast({
          title: 'Error',
          description: error.message,
          variant: 'warning',
        });
      }
    },
    [fetchTicketProgress, setOpen],
  );

  return (
    <Form {...method}>
      <form className="space-y-2" onSubmit={method.handleSubmit(onSubmit)}>
        <Form.Field
          name="number"
          control={method.control}
          render={({ field }) => (
            <Form.Item>
              <Form.Label>Ticket Number</Form.Label>
              <Form.Control>
                <Input
                  {...field}
                  placeholder="Enter ticket number"
                  autoComplete="ticket-number"
                  autoFocus
                />
              </Form.Control>
              <Form.Message />
            </Form.Item>
          )}
        />
        <Button
          type="submit"
          className="w-full [&_div]:flex-none"
          disabled={loading}
        >
          {loading ? <Spinner size="sm" /> : <IconReload />}
          Check progress
        </Button>
      </form>
    </Form>
  );
};

export const TicketStatusInlineValue = ({
  status,
  hasName = false,
  ...props
}: React.ComponentProps<Icon> & {
  status: ITicketStatus;
  hasName?: boolean;
}) => {
  const numericType =
    (typeof status.type === 'string'
      ? Number.parseInt(status.type, 10)
      : status.type) - 1;

  const StatusIconComponent = [
    IconCircle,
    IconCircleDot,
    IconCircleDashed,
    IconCircleCheck,
    IconCircleDashedCheck,
    IconCircleX,
  ][numericType];

  const colorClassName = [
    'text-warning',
    'text-info',
    'text-muted-foreground',
    'text-success',
    'text-destructive',
  ][numericType];

  if (!StatusIconComponent) {
    return null;
  }

  const iconElement = (
    <StatusIconComponent {...props} className="size-4" color={status.color} />
  );

  return (
    <Tooltip.Provider>
      <Tooltip>
        <Tooltip.Trigger asChild>
          <div
            className={cn(
              'flex items-center gap-2 flex-none rounded-sm p-1',
              colorClassName,
            )}
            style={{
              backgroundColor: `${status.color}25`,
            }}
          >
            {iconElement}
            {hasName ? status.name : null}
          </div>
        </Tooltip.Trigger>
        <Tooltip.Content>
          <p className="capitalize">{status.name}</p>
        </Tooltip.Content>
      </Tooltip>
    </Tooltip.Provider>
  );
};
