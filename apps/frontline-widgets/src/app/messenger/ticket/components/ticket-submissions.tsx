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
} from '@tabler/icons-react';
import {
  Button,
  Dialog,
  Form,
  Input,
  PhoneInput,
  Spinner,
  toast,
  InfoCard,
  Label,
  Textarea,
  cn,
} from 'erxes-ui';
import { useCallback, useState } from 'react';
import { useTicketProgressForms } from '../hooks/useTicketProgressForms';
import { useForgotTicketNumber } from '../hooks/useForgotTicketNumber';
import {
  ITicketStatus,
  TTicketCheckProgressForm,
  TTicketForgotProgressForm,
} from '../types';
import { useGetTicketProgress } from '../hooks/useGetTicketProgress';
import { SubmitHandler } from 'react-hook-form';
import { useAtomValue } from 'jotai';
import { ticketProgressAtom } from '../../states';
import { format } from 'date-fns';

export const TicketSubmissions = ({
  setPage,
}: {
  setPage: (page: 'submissions' | 'submit' | 'progress') => void;
}) => {
  const ticketProgress = useAtomValue(ticketProgressAtom);
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
                  value={
                    JSON.parse(ticketProgress.description)?.[0]?.content?.[0]
                      ?.text || ''
                  }
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
        <TicketSubmissionProgress />
        <Button
          type="button"
          className="bg-primary flex-none shadow-2xs"
          onClick={() => setPage('submit')}
        >
          <IconPlus size={16} />
          Issue new ticket
        </Button>
      </div>
    </div>
  );
};

export const TicketSubmissionProgress = () => {
  const [open, setOpen] = useState(false);
  const [forget, setForget] = useState<string | null>('get-number');

  const render = () => {
    switch (forget) {
      case 'forget-number':
        return <TicketForgetNumberForm setForget={setForget} />;
      case 'get-number':
        return <TicketProgressForm setForget={setForget} setOpen={setOpen} />;
      default:
        return <TicketProgressForm setForget={setForget} setOpen={setOpen} />;
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <Button
          type="button"
          variant="outline"
          className="flex-none shadow-2xs"
        >
          <IconReload size={16} />
          Check progress
        </Button>
      </Dialog.Trigger>
      <Dialog.Content className="max-w-xs rounded-lg">
        <Dialog.HeaderCombined
          title={
            forget === 'forget-number' ? 'Get ticket number' : 'Check progress'
          }
          description="Check the progress of your ticket"
        />
        <div className="flex flex-col gap-2">{render()}</div>
      </Dialog.Content>
    </Dialog>
  );
};

export const TicketProgressForm = ({
  setForget,
  setOpen,
}: {
  setForget: (value: string) => void;
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
        <Button
          type="button"
          variant="ghost"
          className="w-full text-accent-foreground text-xs"
          onClick={() => setForget('forget-number')}
        >
          Forgot ticket number?
        </Button>
      </form>
    </Form>
  );
};

export const TicketForgetNumberForm = ({
  setForget,
}: {
  setForget: (value: string) => void;
}) => {
  const { forgotMethod } = useTicketProgressForms();
  const { forgotTicketNumber, loading } = useForgotTicketNumber();

  function handleBack() {
    forgotMethod.reset();
    setForget('get-number');
  }

  const onSubmit = (data: TTicketForgotProgressForm) => {
    forgotTicketNumber({
      variables: data,
      onCompleted: () => {
        forgotMethod.reset();
        toast({
          title: 'Ticket number has been sent to your phone',
          variant: 'success',
        });
        setForget('get-number');
      },
      onError: (error) => {
        toast({
          title: 'Error',
          description: error.message,
          variant: 'warning',
        });
      },
    });
  };

  return (
    <Form {...forgotMethod}>
      <form
        className="space-y-2"
        onSubmit={forgotMethod.handleSubmit(onSubmit)}
      >
        <Form.Field
          name="phoneNumber"
          control={forgotMethod.control}
          render={({ field }) => (
            <Form.Item>
              <Form.Label>Phone Number</Form.Label>
              <Form.Control>
                <PhoneInput
                  defaultCountry="MN"
                  className="bg-background"
                  {...field}
                />
              </Form.Control>
              <Form.Message />
            </Form.Item>
          )}
        />
        <Form.Field
          name="email"
          control={forgotMethod.control}
          render={({ field }) => (
            <Form.Item>
              <Form.Label>Email</Form.Label>
              <Form.Control>
                <Input type="email" placeholder="Enter email" {...field} />
              </Form.Control>
              <Form.Message />
            </Form.Item>
          )}
        />
        <Button type="submit" className="w-full">
          {loading ? <Spinner size="sm" /> : 'Get Ticket Number'}
        </Button>
        <Button
          type="button"
          variant="ghost"
          className="w-full text-accent-foreground text-xs"
          onClick={handleBack}
        >
          Back
        </Button>
      </form>
    </Form>
  );
};

export const TicketStatusInlineValue = ({
  status,
  ...props
}: React.ComponentProps<Icon> & { status: ITicketStatus }) => {
  const numericType =
    (typeof status.type === 'string'
      ? parseInt(status.type, 10)
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

  return (
    <StatusIconComponent
      {...props}
      color={status.color}
      style={{
        backgroundColor: `${status.color}25`,
      }}
      className={cn('size-6 flex-none rounded-sm p-1', colorClassName)}
    />
  );
};
