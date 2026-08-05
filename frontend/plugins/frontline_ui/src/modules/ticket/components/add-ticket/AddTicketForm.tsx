import { SelectAssigneeTicket } from '@/ticket/components/ticket-selects/SelectAssigneeTicket';
import { SelectChannel } from '@/ticket/components/ticket-selects/SelectChannel';
import { SelectDateTicket } from '@/ticket/components/ticket-selects/SelectDateTicket';
import { SelectPipeline } from '@/ticket/components/ticket-selects/SelectPipeline';
import { SelectPriorityTicket } from '@/ticket/components/ticket-selects/SelectPriorityTicket';
import { SelectStatusTicket } from '@/ticket/components/ticket-selects/SelectStatusTicket';
import { useCreateTicket } from '@/ticket/hooks/useCreateTicket';
import { ticketCreateDefaultValuesState } from '@/ticket/states/ticketCreateSheetState';
import { TAddTicket, addTicketSchema } from '@/ticket/types';
import { Block } from '@blocknote/core';
import { zodResolver } from '@hookform/resolvers/zod';
import { IconTags } from '@tabler/icons-react';
import {
  BlockEditor,
  Button,
  Combobox,
  Form,
  Input,
  Separator,
  Sheet,
  Spinner,
  useBlockEditor,
  useQueryState,
  useToast,
} from 'erxes-ui';
import { useAtom, useAtomValue } from 'jotai';
import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { TagsSelect, currentUserState } from 'ui-modules';

export const AddTicketForm = ({
  onClose,
  onComplete,
}: {
  onClose: () => void;
  onComplete?: (ticketId: string) => void;
}) => {
  const { t } = useTranslation('frontline');
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

  const defaultValues = useMemo(() => {
    const resolvedPipelineId =
      defaultValuesState?.pipelineId || pipelineId || undefined;

    return {
      channelId: defaultValuesState?.channelId || channelId || undefined,
      pipelineId: resolvedPipelineId,
      statusId: defaultValuesState?.statusId || undefined,
      name: '',
      priority: 0,
      assigneeId: resolvedPipelineId ? undefined : currentUser?._id,
      startDate: undefined,
      targetDate: undefined,
    };
  }, [channelId, currentUser?._id, defaultValuesState, pipelineId]);
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
  }, [defaultValues, defaultValuesState, form, setDefaultValues]);

  const handleDescriptionChange = async () => {
    const content = await editor?.document;
    if (content) {
      setDescriptionContent(content.slice(0, -1) as Block[]);
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
            title: t('error'),
            description: Object.entries(errors)[0][1].message,
            variant: 'destructive',
          });
        })}
        className="h-full flex flex-col"
      >
        <Sheet.Header>
          <Sheet.Title>{t('new-ticket')}</Sheet.Title>
          <Sheet.Description className="sr-only">
            {t('add-ticket-description')}
          </Sheet.Description>
          <Sheet.Close />
        </Sheet.Header>
        <Sheet.Content className="flex min-h-0 flex-col gap-4 px-5 py-4">
          <Form.Field
            name="name"
            control={form.control}
            render={({ field }) => (
              <Form.Item>
                <Form.Label className="sr-only">{t('name')}</Form.Label>
                <Form.Control>
                  <Input
                    {...field}
                    className="shadow-none focus-visible:shadow-none h-8 text-xl p-0"
                    placeholder={t('ticket-name')}
                  />
                </Form.Control>
                <Form.Message />
              </Form.Item>
            )}
          />
          <TagsSelect.Provider
            type="frontline:ticket"
            mode="multiple"
            value={form.getValues('tagIds') || []}
            onValueChange={(value) => form.setValue('tagIds', value)}
          >
            <div className="flex w-full flex-wrap items-center gap-2 rounded-lg bg-muted/50 p-3">
              <Form.Field
                name="channelId"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Form.Item>
                    <Form.Label className="sr-only">{t('channels')}</Form.Label>
                    <SelectChannel.FormItem
                      value={field.value || ''}
                      onValueChange={(value) => {
                        field.onChange(value);
                        form.setValue('pipelineId', '');
                        form.setValue('statusId', '');
                      }}
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
                    <Form.Label className="sr-only">
                      {t('pipeline-label')}
                    </Form.Label>
                    <SelectPipeline.FormItem
                      value={field.value || ''}
                      onValueChange={(value) => {
                        field.onChange(value);
                        form.setValue('statusId', '');
                      }}
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
                    <Form.Label className="sr-only">
                      {t('status-label')}
                    </Form.Label>
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
                    <Form.Label className="sr-only">
                      {t('priority-label')}
                    </Form.Label>
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
                    <Form.Label className="sr-only">
                      {t('assignee-label')}
                    </Form.Label>
                    <SelectAssigneeTicket.FormItem
                      value={field.value || ''}
                      onValueChange={field.onChange}
                    />
                  </Form.Item>
                )}
              />

              <Form.Field
                name="startDate"
                control={form.control}
                render={({ field }) => (
                  <Form.Item>
                    <Form.Label className="sr-only">
                      {t('start-date-label')}
                    </Form.Label>
                    <SelectDateTicket.FormItem
                      value={field.value}
                      placeholder={t('start-date-label')}
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
                    <Form.Label className="sr-only">
                      {t('due-date-label')}
                    </Form.Label>
                    <SelectDateTicket.FormItem
                      value={field.value}
                      onValueChange={(value) => field.onChange(value)}
                      placeholder={t('due-date-label')}
                    />
                  </Form.Item>
                )}
              />
              <IconTags className="ml-2 size-5 text-muted-foreground" />
              <TagsSelect.SelectedList />
              <Form.Field
                name="tagIds"
                control={form.control}
                render={() => (
                  <Form.Item>
                    <Form.Label className="sr-only">
                      {t('tags-label')}
                    </Form.Label>
                    <Form.Control>
                      <TagsSelect.Trigger variant="ICON" />
                    </Form.Control>
                  </Form.Item>
                )}
              />
              <Combobox.Content>
                <TagsSelect.Content />
              </Combobox.Content>
            </div>
          </TagsSelect.Provider>
          <Separator className="my-4" />
          <div className="min-h-56 flex-1 overflow-y-auto">
            <BlockEditor
              editor={editor}
              onChange={handleDescriptionChange}
              className="min-h-full"
            />
          </div>
        </Sheet.Content>
        <Sheet.Footer>
          <Button
            type="button"
            variant="ghost"
            disabled={createTicketLoading}
            onClick={() => {
              onClose();
              form.reset();
              editor?.removeBlocks(editor?.document);
              setDescriptionContent(undefined);
            }}
          >
            {t('cancel')}
          </Button>
          <Button type="submit" disabled={createTicketLoading}>
            {createTicketLoading ? <Spinner /> : t('save')}
          </Button>
        </Sheet.Footer>
      </form>
    </Form>
  );
};
