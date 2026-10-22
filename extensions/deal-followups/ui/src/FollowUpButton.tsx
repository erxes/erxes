import { zodResolver } from '@hookform/resolvers/zod';
import { IconCalendarClock } from '@tabler/icons-react';
import { useMutation, useQuery } from 'erxes-sdk/react';
import {
  Button,
  DatePicker,
  Form,
  Popover,
  Spinner,
  Textarea,
  toast,
} from 'erxes-ui';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Can } from 'ui-modules';
import * as z from 'zod';
import { api, errorMessage, formatDay, fromDay, toDay, today } from './api';

const FollowUpForm = z.object({
  dueDate: z.date({ error: 'Pick a date' }),
  note: z.string().trim().max(500, 'Keep the note under 500 characters'),
});

type FollowUpFormValues = z.infer<typeof FollowUpForm>;

// Exposed as ./followUpButton for the deal header's actions. Its props are
// what that slot passes.
export const FollowUpButton = ({ dealId }: { dealId: string }) => {
  const [open, setOpen] = useState(false);
  const { data: followUp, error } = useQuery(api.followUps.forDeal, { dealId });
  const set = useMutation(api.followUps.set);
  const clear = useMutation(api.followUps.clear);
  const form = useForm<FollowUpFormValues>({
    resolver: zodResolver(FollowUpForm),
  });

  useEffect(() => {
    if (open) {
      form.reset({
        dueDate: followUp ? fromDay(followUp.dueDate) : undefined,
        note: followUp?.note ?? '',
      });
    }
  }, [open, followUp, form]);

  const onSubmit = async ({ dueDate, note }: FollowUpFormValues) => {
    try {
      await set.mutate({ dealId, dueDate: toDay(dueDate), note });
      toast({
        title: `Follow-up set for ${formatDay(toDay(dueDate))}`,
        variant: 'success',
      });
      setOpen(false);
    } catch (err) {
      toast({
        title: 'Could not set follow-up',
        description: errorMessage(err),
        variant: 'destructive',
      });
    }
  };

  const onClear = async () => {
    try {
      await clear.mutate({ dealId });
      toast({ title: 'Follow-up cleared', variant: 'success' });
      setOpen(false);
    } catch (err) {
      toast({
        title: 'Could not clear follow-up',
        description: errorMessage(err),
        variant: 'destructive',
      });
    }
  };

  if (error) {
    return (
      <Button variant="outline" disabled title={error}>
        <IconCalendarClock />
        Follow-up unavailable
      </Button>
    );
  }

  if (followUp === undefined) {
    return <Spinner size="sm" />;
  }

  const overdue = followUp !== null && followUp.dueDate < today();

  return (
    <Can action="dealFollowups.followUps.view">
      <Popover open={open} onOpenChange={setOpen}>
        <Popover.Trigger asChild>
          <Button
            variant="outline"
            className={overdue ? 'text-destructive' : undefined}
            title={followUp?.note || undefined}
          >
            <IconCalendarClock />
            {followUp
              ? `${overdue ? 'Overdue' : 'Follow up'} ${formatDay(
                  followUp.dueDate,
                )}`
              : 'Follow up'}
          </Button>
        </Popover.Trigger>
        <Popover.Content align="end" className="w-auto p-3">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="flex flex-col gap-3"
            >
              <Form.Field
                control={form.control}
                name="dueDate"
                render={({ field }) => (
                  <Form.Item>
                    <Form.Label>Follow up on</Form.Label>
                    <Form.Control>
                      <DatePicker
                        inline
                        value={field.value}
                        minDate={fromDay(today())}
                        onChange={(date) =>
                          field.onChange(
                            date instanceof Date ? date : undefined,
                          )
                        }
                      />
                    </Form.Control>
                    <Form.Message />
                  </Form.Item>
                )}
              />
              <Form.Field
                control={form.control}
                name="note"
                render={({ field }) => (
                  <Form.Item>
                    <Form.Label>Note</Form.Label>
                    <Form.Control>
                      <Textarea placeholder="What to follow up on" {...field} />
                    </Form.Control>
                    <Form.Message />
                  </Form.Item>
                )}
              />
              <Can
                action="dealFollowups.followUps.manage"
                fallback={
                  <p className="text-sm text-muted-foreground">
                    You can view follow-ups but not change them.
                  </p>
                }
              >
                <div className="flex justify-end gap-2">
                  {followUp && (
                    <Button
                      type="button"
                      variant="ghost"
                      disabled={clear.pending}
                      onClick={onClear}
                    >
                      Mark done
                    </Button>
                  )}
                  <Button type="submit" disabled={set.pending}>
                    {set.pending ? 'Saving…' : 'Save'}
                  </Button>
                </div>
              </Can>
            </form>
          </Form>
        </Popover.Content>
      </Popover>
    </Can>
  );
};
