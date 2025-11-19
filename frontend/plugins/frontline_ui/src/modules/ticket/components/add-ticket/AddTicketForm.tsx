import { SelectPriorityTicket } from '@/ticket/components/ticket-selects/SelectPriorityTicket';
import { SelectDateTicket } from '@/ticket/components/ticket-selects/SelectDateTicket';
import { SelectStatusTicket } from '@/ticket/components/ticket-selects/SelectStatusTicket';
import { useCreateTicket } from '@/ticket/hooks/useCreateTicket';
import { ticketCreateDefaultValuesState } from '@/ticket/states/ticketCreateSheetState';
import { addTicketSchema } from '@/ticket/types';
import { Block } from '@blocknote/core';
import { zodResolver } from '@hookform/resolvers/zod';
import { SelectChannel } from '@/ticket/components/ticket-selects/SelectChannel';
import { SelectPipeline } from '@/ticket/components/ticket-selects/SelectPipeline';
import {
  BlockEditor,
  Button,
  Form,
  Input,
  Separator,
  Sheet,
  useBlockEditor,
  useQueryState,
  useToast,
} from 'erxes-ui';
import { useAtom, useAtomValue } from 'jotai';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { TAddTicket } from '@/ticket/types';
import { currentUserState } from 'ui-modules';
import { SelectAssigneeTicket } from '@/ticket/components/ticket-selects/SelectAssigneeTicket';

export const AddTicketForm = ({
  onClose,
  onComplete,
}: {
  onClose: () => void;
  onComplete?: (ticketId: string) => void;
}) => {
  const [pipelineId] = useQueryState<string>('pipelineId');
  const [channelId] = useQueryState<string>('channelId');
  const { toast } = useToast();
  const currentUser = useAtomValue(currentUserState);
  const { createTicket, loading: createTicketLoading } = useCreateTicket();
  const [descriptionContent, setDescriptionContent] = useState<Block[]>();
  const editor = useBlockEditor();
  const [defaultValuesState, setDefaultValues] = useAtom(
    ticketCreateDefaultValuesState,
  );

  const defaultValues = {
    channelId: channelId || undefined,
    pipelineId: pipelineId || undefined,
    name: '',
    priority: 0,
    assigneeId: pipelineId ? undefined : currentUser?._id,
    startDate: undefined,
    targetDate: undefined,
  };
  console.log(channelId, 'channelId');
  const form = useForm<TAddTicket>({
    resolver: zodResolver(addTicketSchema),
    defaultValues,
  });

  useEffect(() => {
    form.setFocus('name');
  }, [form]);

  useEffect(() => {
    if (defaultValuesState) {
      form.reset({ ...defaultValues, ...defaultValuesState });
      setDefaultValues(undefined);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultValuesState, form, setDefaultValues]);

  const handleDescriptionChange = async () => {
    const content = await editor?.document;
    if (content) {
      content.pop();
      setDescriptionContent(content as Block[]);
    }
  };

  const onSubmit = async (data: TAddTicket) => {
    createTicket({
      variables: {
        ...data,
        description: JSON.stringify(descriptionContent),
        priority: data.priority || 0,
        statusId: data.statusId,
      },
      onCompleted: (data) => {
        toast({
          title: 'Success',
          description: 'Ticket created successfully',
          variant: 'default',
        });
        onClose();
        onComplete?.(data.createTicket._id);
      },
    });
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit, (errors) => {
          toast({
            title: 'Error',
            description: Object.entries(errors)[0][1].message,
            variant: 'destructive',
          });
        })}
        className="h-full flex flex-col"
      >
        <Sheet.Header className="flex items-center gap-2 ">
          <Sheet.Title className="">New ticket</Sheet.Title>
        </Sheet.Header>
        <Sheet.Content className="px-7 py-4 gap-2 flex flex-col min-h-0">
          <Form.Field
            name="name"
            control={form.control}
            render={({ field }) => (
              <Form.Item>
                <Form.Label className="sr-only">Name</Form.Label>
                <Form.Control>
                  <Input
                    {...field}
                    className="shadow-none focus-visible:shadow-none h-8 text-xl p-0"
                    placeholder="Ticket Name"
                  />
                </Form.Control>
              </Form.Item>
            )}
          />
          <div className="flex gap-2 w-full flex-wrap">
            <Form.Field
              name="channelId"
              control={form.control}
              render={({ field, fieldState }) => (
                <Form.Item>
                  <Form.Label className="sr-only">Channel</Form.Label>
                  <SelectChannel.FormItem
                    value={field.value || ''}
                    onValueChange={(value) => field.onChange(value)}
                  />
                  {fieldState.error && (
                    <p className="text-destructive text-sm mt-1">
                      {fieldState.error.message}
                    </p>
                  )}
                </Form.Item>
              )}
            />
            <Form.Field
              name="pipelineId"
              control={form.control}
              render={({ field, fieldState }) => (
                <Form.Item>
                  <Form.Label className="sr-only">Pipeline</Form.Label>
                  <SelectPipeline.FormItem
                    value={field.value || ''}
                    onValueChange={(value) => field.onChange(value)}
                    form={form}
                  />
                  {fieldState.error && (
                    <p className="text-destructive text-sm mt-1">
                      {fieldState.error.message}
                    </p>
                  )}
                </Form.Item>
              )}
            />
            <Form.Field
              name="statusId"
              control={form.control}
              render={({ field, fieldState }) => (
                <Form.Item>
                  <Form.Label className="sr-only">Status</Form.Label>
                  <SelectStatusTicket.FormItem
                    value={field.value || ''}
                    onValueChange={(value) => field.onChange(value)}
                    form={form}
                  />
                  {fieldState.error && (
                    <p className="text-destructive text-sm mt-1">
                      {fieldState.error.message}
                    </p>
                  )}
                </Form.Item>
              )}
            />
            <Form.Field
              name="priority"
              control={form.control}
              render={({ field }) => (
                <Form.Item>
                  <Form.Label className="sr-only">Priority</Form.Label>
                  <SelectPriorityTicket.FormItem
                    value={field.value || 0}
                    onValueChange={(value) => field.onChange(value)}
                  />
                </Form.Item>
              )}
            />
            <Form.Field
              name="assigneeId"
              control={form.control}
              render={({ field }) => (
                <Form.Item>
                  <Form.Label className="sr-only">Assignee</Form.Label>
                  <SelectAssigneeTicket.FormItem
                    value={field.value || ''}
                    onValueChange={(value: any) => {
                      field.onChange(value);
                    }}
                  />
                </Form.Item>
              )}
            />

            <Form.Field
              name="startDate"
              control={form.control}
              render={({ field }) => (
                <Form.Item>
                  <Form.Label className="sr-only">Start Date</Form.Label>
                  <SelectDateTicket.FormItem
                    value={field.value}
                    placeholder="Start Date"
                    onValueChange={(value) => field.onChange(value)}
                  />
                </Form.Item>
              )}
            />
            <Form.Field
              name="targetDate"
              control={form.control}
              render={({ field }) => (
                <Form.Item>
                  <Form.Label className="sr-only">Target Date</Form.Label>
                  <SelectDateTicket.FormItem
                    value={field.value}
                    onValueChange={(value) => field.onChange(value)}
                    placeholder="Target Date"
                  />
                </Form.Item>
              )}
            />
          </div>
          <Separator className="my-4" />
          <div className="flex-1 overflow-y-auto">
            <BlockEditor
              editor={editor}
              onChange={handleDescriptionChange}
              className="read-only min-h-full"
            />
          </div>
        </Sheet.Content>
        <Sheet.Footer className="flex justify-end shrink-0 gap-1 px-5">
          <Button
            type="button"
            variant="ghost"
            className="bg-background hover:bg-background/90"
            onClick={() => {
              onClose();
              form.reset();
              editor?.removeBlocks(editor?.document);
              setDescriptionContent(undefined);
            }}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            className="bg-primary text-primary-foreground hover:bg-primary/90"
            disabled={createTicketLoading}
          >
            Save
          </Button>
        </Sheet.Footer>
      </form>
    </Form>
  );
};
