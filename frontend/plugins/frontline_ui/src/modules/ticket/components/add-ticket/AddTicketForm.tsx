import { useCanManageChannels } from '@/channels/hooks/useCanManageChannels';
import {
  PIPELINE_TAB_SEGMENTS,
  getPipelinePath,
} from '@/pipelines/constants/pipelineTabs';
import { TicketCreateLayoutRows } from '@/ticket/components/add-ticket/TicketCreateLayoutRows';
import { SelectChannel } from '@/ticket/components/ticket-selects/SelectChannel';
import { SelectPipeline } from '@/ticket/components/ticket-selects/SelectPipeline';
import { SelectStatusTicket } from '@/ticket/components/ticket-selects/SelectStatusTicket';
import {
  TICKET_LAYOUT_SYSTEM_LABELS,
  TICKET_PROPERTY_CONTENT_TYPE,
} from '@/ticket/constants/createLayout';
import { useCreateTicket } from '@/ticket/hooks/useCreateTicket';
import { useTicketCreateFields } from '@/ticket/hooks/useTicketCreateFields';
import {
  TTicketLayoutCell,
  useTicketCreateLayout,
} from '@/ticket/hooks/useTicketCreateLayout';
import { TTicketDraft } from '@/ticket/hooks/useCreateTicketRecord';
import { TAddTicket, addTicketSchema, TicketHotKeyScope } from '@/ticket/types';
import { Block } from '@blocknote/core';
import { IconSettings } from '@tabler/icons-react';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  BlockEditor,
  Button,
  Form,
  Input,
  useBlockEditor,
  useToast,
  usePreviousHotkeyScope,
  useScopedHotkeys,
} from 'erxes-ui';
import { useAtomValue } from 'jotai';
import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import {
  currentUserState,
  PANEL_INPUT_CLASS_NAME,
  PanelFormLayout,
  PanelFormRow,
  useSidePanel,
  useSidePanelDraft,
} from 'ui-modules';

export const AddTicketForm = () => {
  const { t } = useTranslation('frontline', { keyPrefix: 'modules.ticket' });
  const draft = useSidePanelDraft<TTicketDraft>(TICKET_PROPERTY_CONTENT_TYPE);
  const { back, canGoBack, close, openRecord } = useSidePanel();
  const onClose = () => (canGoBack ? back() : close());
  const { toast } = useToast();
  const currentUser = useAtomValue(currentUserState);
  const { createTicket, loading: createTicketLoading } = useCreateTicket();
  const [descriptionContent, setDescriptionContent] = useState<Block[]>();
  const editor = useBlockEditor();
  const resolvedPipelineId = draft.pipelineId;
  const defaultValues: Partial<TAddTicket> = {
    name: '',
    priority: 0,
    assigneeId: resolvedPipelineId ? undefined : currentUser?._id,
    ...draft,
  };
  const form = useForm<TAddTicket>({
    resolver: zodResolver(addTicketSchema),
    defaultValues,
  });

  const previousDraft = useRef(draft);
  useEffect(() => {
    if (previousDraft.current === draft) return;
    previousDraft.current = draft;
    if (!Object.keys(draft).length) return;
    form.reset({
      name: '',
      priority: 0,
      assigneeId: draft.pipelineId ? undefined : currentUser?._id,
      ...draft,
    });
  }, [draft, form, currentUser?._id]);

  const selectedPipelineId = form.watch('pipelineId');
  const selectedChannelId = form.watch('channelId');
  const canManageChannel = useCanManageChannels(
    selectedChannelId ? [selectedChannelId] : [],
  );
  const { rows, rules } = useTicketCreateLayout(
    selectedPipelineId || undefined,
  );
  const {
    visibleRows,
    propertiesData,
    missingIds,
    setPropertyValue,
    findMissing,
    shownPropertiesData,
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

  const {
    setHotkeyScopeAndMemorizePreviousScope,
    goBackToPreviousHotkeyScope,
  } = usePreviousHotkeyScope();
  useEffect(() => {
    setHotkeyScopeAndMemorizePreviousScope(TicketHotKeyScope.TicketAddSheet);
    return goBackToPreviousHotkeyScope;
  }, [setHotkeyScopeAndMemorizePreviousScope, goBackToPreviousHotkeyScope]);
  useScopedHotkeys(
    'esc',
    onClose,
    TicketHotKeyScope.TicketAddSheet,
    [onClose],
    { enableOnFormTags: true },
  );

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
        customerId: draft.customerId,
        companyId: draft.companyId,
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
        if (data.createTicket) {
          openRecord(
            {
              contentType: TICKET_PROPERTY_CONTENT_TYPE,
              contentId: data.createTicket._id,
            },
            { replace: true },
          );
          draft.onComplete?.(data.createTicket._id);
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
        className="flex flex-1 min-h-0 flex-col"
      >
        <PanelFormLayout
          onCancel={onClose}
          saving={createTicketLoading}
          saveLabel={t('add-ticket', 'Add ticket')}
        >
          <Form.Field
            name="name"
            control={form.control}
            render={({ field }) => (
              <Form.Item>
                <PanelFormRow
                  label={
                    <Form.Label className="font-sans text-xs font-medium normal-case text-accent-foreground">
                      {t('name', 'Name')}
                    </Form.Label>
                  }
                  required
                  error={form.formState.errors.name?.message}
                >
                  <Form.Control>
                    <Input
                      {...field}
                      className={PANEL_INPUT_CLASS_NAME}
                      placeholder={t('ticket-name', 'Ticket Name')}
                    />
                  </Form.Control>
                </PanelFormRow>
              </Form.Item>
            )}
          />
          <div className="flex flex-col gap-1">
            <Form.Field
              name="channelId"
              control={form.control}
              render={({ field, fieldState }) => (
                <Form.Item>
                  <PanelFormRow
                    label={
                      <Form.Label className="font-sans text-xs font-medium normal-case text-accent-foreground">
                        {t('channel', 'Channel')}
                      </Form.Label>
                    }
                    required
                    error={fieldState.error?.message}
                  >
                    <SelectChannel.FormItem
                      variant="table"
                      value={field.value || ''}
                      onValueChange={(value) => {
                        field.onChange(value);
                        form.setValue('pipelineId', '');
                        form.setValue('statusId', '');
                      }}
                    />
                  </PanelFormRow>
                </Form.Item>
              )}
            />
            <Form.Field
              name="pipelineId"
              control={form.control}
              render={({ field, fieldState }) => (
                <Form.Item>
                  <PanelFormRow
                    label={
                      <Form.Label className="font-sans text-xs font-medium normal-case text-accent-foreground">
                        {t('pipeline-label', 'Pipeline')}
                      </Form.Label>
                    }
                    required
                    error={fieldState.error?.message}
                  >
                    <SelectPipeline.FormItem
                      variant="table"
                      value={field.value || ''}
                      onValueChange={(value) => {
                        field.onChange(value);
                        form.setValue('statusId', '');
                      }}
                      form={form}
                    />
                  </PanelFormRow>
                </Form.Item>
              )}
            />
            <Form.Field
              name="statusId"
              control={form.control}
              render={({ field, fieldState }) => (
                <Form.Item>
                  <PanelFormRow
                    label={
                      <Form.Label className="font-sans text-xs font-medium normal-case text-accent-foreground">
                        {t('status-label', 'Status')}
                      </Form.Label>
                    }
                    required
                    error={fieldState.error?.message}
                  >
                    <SelectStatusTicket.FormItem
                      variant="table"
                      value={field.value || ''}
                      onValueChange={(value) => field.onChange(value)}
                      form={form}
                    />
                  </PanelFormRow>
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
          <div className="flex min-w-0 flex-col gap-1.5 pt-2">
            <span className="text-xs font-medium text-accent-foreground">
              {t('description', 'Description')}
            </span>
            <BlockEditor
              editor={editor}
              onChange={handleDescriptionChange}
              className="read-only min-h-40"
            />
          </div>

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
        </PanelFormLayout>
      </form>
    </Form>
  );
};
