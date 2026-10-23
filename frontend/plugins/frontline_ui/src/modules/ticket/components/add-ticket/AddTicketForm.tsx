import { useCanManageChannels } from '@/channels/hooks/useCanManageChannels';
import {
  PIPELINE_TAB_SEGMENTS,
  getPipelinePath,
} from '@/pipelines/constants/pipelineTabs';
import { TicketCreateLayoutRows } from '@/ticket/components/add-ticket/TicketCreateLayoutRows';
import { SelectChannel } from '@/ticket/components/ticket-selects/SelectChannel';
import { SelectPipeline } from '@/ticket/components/ticket-selects/SelectPipeline';
import { SelectStatusTicket } from '@/ticket/components/ticket-selects/SelectStatusTicket';
import { TICKET_LAYOUT_SYSTEM_LABELS } from '@/ticket/constants/createLayout';
import { useCreateTicket } from '@/ticket/hooks/useCreateTicket';
import { useTicketCreateFields } from '@/ticket/hooks/useTicketCreateFields';
import {
  TTicketLayoutCell,
  useTicketCreateLayout,
} from '@/ticket/hooks/useTicketCreateLayout';
import { ticketCreateDefaultValuesState } from '@/ticket/states/ticketCreateSheetState';
import { TAddTicket, addTicketSchema } from '@/ticket/types';
import { Block } from '@blocknote/core';
import { IconSettings } from '@tabler/icons-react';
import { zodResolver } from '@hookform/resolvers/zod';
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
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { currentUserState } from 'ui-modules';

export const AddTicketForm = ({
  onClose,
  onComplete,
  contacts,
}: {
  onClose: () => void;
  onComplete?: (ticketId: string) => void;
  // Customers / companies the ticket is created for; linked on the server.
  contacts?: { customerId?: string; companyId?: string };
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

  const resolvedPipelineId =
    defaultValuesState?.pipelineId || pipelineId || undefined;
  const defaultValues = {
    channelId: defaultValuesState?.channelId || channelId || undefined,
    pipelineId: resolvedPipelineId,
    statusId: defaultValuesState?.statusId || undefined,
    name: '',
    priority: 0,
    assigneeId: resolvedPipelineId ? undefined : currentUser?._id,
    branchId: undefined,
    departmentId: undefined,
    startDate: undefined,
    targetDate: undefined,
  };
  const form = useForm<TAddTicket>({
    resolver: zodResolver(addTicketSchema),
    defaultValues,
  });

  const selectedPipelineId = form.watch('pipelineId');
  const selectedChannelId = form.watch('channelId');
  const canManageChannel = useCanManageChannels(
    selectedChannelId ? [selectedChannelId] : [],
  );
  const { rows, rules } = useTicketCreateLayout(selectedPipelineId || undefined);
  const {
    visibleRows,
    propertiesData,
    missingIds,
    setPropertyValue,
    findMissing,
    shownPropertiesData,
    reset: resetFields,
  } = useTicketCreateFields({ rows, rules });

  const labelOf = (cell: TTicketLayoutCell) =>
    cell.kind === 'system'
      ? t(
          TICKET_LAYOUT_SYSTEM_LABELS[cell.code].key,
          TICKET_LAYOUT_SYSTEM_LABELS[cell.code].fallback,
        )
      : cell.field.name;

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
    const missing = findMissing({
      values: data,
      descriptionEmpty: !descriptionContent?.length,
      descriptionLabel: t('description', 'Description'),
      labelOf,
    });

    if (missing.length) {
      toast({
        title: t('required-fields-missing', 'Fill in the required fields'),
        description: missing.join(', '),
        variant: 'destructive',
      });
      return;
    }

    createTicket({
      variables: {
        ...data,
        description: JSON.stringify(descriptionContent),
        priority: data.priority || 0,
        statusId: data.statusId,
        propertiesData: shownPropertiesData(),
        ...contacts,
      },
      // The ticket keeps its contacts itself; contacts' ticket lists are
      // read again.
      update: (cache) =>
        cache.evict({ id: 'ROOT_QUERY', fieldName: 'getTickets' }),
      onCompleted: (data) => {
        toast({
          title: t('success', 'Success!'),
          description: t(
            'ticket-created-successfully',
            'Ticket created successfully',
          ),
          variant: 'default',
        });
        onClose();
        if (data.createTicket) {
          onComplete?.(data.createTicket._id);
        }
      },
    });
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit, (errors) => {
          toast({
            title: t('error', 'Error'),
            description: Object.entries(errors)[0][1].message,
            variant: 'destructive',
          });
        })}
        className="h-full flex flex-col"
      >
        <Sheet.Header className="flex items-center gap-2 ">
          <Sheet.Title className="">
            {t('new-ticket', 'New ticket')}
          </Sheet.Title>
        </Sheet.Header>
        <Sheet.Content className="px-7 py-4 gap-2 flex flex-col min-h-0">
          <Form.Field
            name="name"
            control={form.control}
            render={({ field }) => (
              <Form.Item>
                <Form.Label className="sr-only">{t('name', 'Name')}</Form.Label>
                <Form.Control>
                  <Input
                    {...field}
                    className="shadow-none focus-visible:shadow-none h-8 text-xl p-0"
                    placeholder={t('ticket-name', 'Ticket Name')}
                  />
                </Form.Control>
              </Form.Item>
            )}
          />
          <div className="flex gap-2 w-full flex-wrap items-center">
            <Form.Field
              name="channelId"
              control={form.control}
              render={({ field, fieldState }) => (
                <Form.Item>
                  <Form.Label className="sr-only">
                    {t('channels', 'Channels')}
                  </Form.Label>
                  <SelectChannel.FormItem
                    label={t('channel', 'Channel')}
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
                    {t('pipeline-label', 'Pipeline')}
                  </Form.Label>
                  <SelectPipeline.FormItem
                    label={t('pipeline', 'Pipeline')}
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
                    {t('status-label', 'Status')}
                  </Form.Label>
                  <SelectStatusTicket.FormItem
                    label={t('status', 'Status')}
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
          </div>
          <TicketCreateLayoutRows
            rows={visibleRows}
            form={form}
            propertiesData={propertiesData}
            missingIds={missingIds}
            onPropertyChange={setPropertyValue}
          />
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
          {selectedChannelId &&
            selectedPipelineId &&
            canManageChannel(selectedChannelId) && (
              <Button
                variant="ghost"
                className="mr-auto text-muted-foreground"
                asChild
              >
                <Link
                  to={getPipelinePath(
                    selectedChannelId,
                    selectedPipelineId,
                    PIPELINE_TAB_SEGMENTS.properties,
                  )}
                  onClick={onClose}
                >
                  <IconSettings />
                  {t('edit-create-form', 'Edit form')}
                </Link>
              </Button>
            )}
          <Button
            type="button"
            variant="ghost"
            className="bg-background hover:bg-background/90"
            onClick={() => {
              onClose();
              form.reset();
              resetFields();
              editor?.removeBlocks(editor?.document);
              setDescriptionContent(undefined);
            }}
          >
            {t('cancel', 'Cancel')}
          </Button>
          <Button
            type="submit"
            className="bg-primary text-primary-foreground hover:bg-primary/90"
            disabled={createTicketLoading}
          >
            {t('save', 'Save')}
          </Button>
        </Sheet.Footer>
      </form>
    </Form>
  );
};
