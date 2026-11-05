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
import { useTicketCreateSession } from '@/ticket/hooks/useTicketCreateSession';
import { useTicketCreateFields } from '@/ticket/hooks/useTicketCreateFields';
import {
  TTicketLayoutCell,
  useTicketCreateLayout,
} from '@/ticket/hooks/useTicketCreateLayout';
import { TTicketDraft } from '@/ticket/hooks/useCreateTicketRecord';
import { usePanelFormDraft } from '@/shared/hooks/usePanelFormDraft';
import { ticketFormDraftsState } from '@/ticket/states/ticketFormDraftsState';
import { TAddTicket, addTicketSchema, TicketHotKeyScope } from '@/ticket/types';
import { IconSettings } from '@tabler/icons-react';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  BlockEditor,
  Button,
  Form,
  Input,
  useBlockEditor,
  useConfirm,
  useToast,
  usePreviousHotkeyScope,
} from 'erxes-ui';
import { useAtomValue } from 'jotai';
import { useEffect, useMemo, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import {
  CompaniesInline,
  CustomersInline,
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
  const { confirm } = useConfirm();
  const { back, canGoBack, close, openRecord } = useSidePanel();
  const onClose = () => {
    return canGoBack ? back() : close();
  };
  const { toast } = useToast();
  const currentUser = useAtomValue(currentUserState);
  const { createTicket } = useCreateTicket();
  const editor = useBlockEditor();
  const defaultValues = useMemo<TAddTicket>(
    () => ({
      name: '',
      channelId: '',
      pipelineId: '',
      statusId: '',
      priority: 0,
      assigneeId: draft.pipelineId ? undefined : currentUser?._id,
      ...draft,
    }),
    [draft, currentUser?._id],
  );
  const form = useForm<TAddTicket>({
    resolver: zodResolver(addTicketSchema),
    defaultValues,
  });
  const { isDirty } = form.formState;
  const onCreatedRef = useRef<(ticketId: string) => void>();
  const createSession = useTicketCreateSession({
    slotKey: `${currentUser?._id ?? 'anonymous'}:new`,
    defaults: defaultValues,
    discardMessage: t('discard-draft', { keyPrefix: '' }),
    onCreated: (ticketId) => onCreatedRef.current?.(ticketId),
  });
  const { clearDraft, isActive } = usePanelFormDraft({
    form,
    recordKey: createSession.recordKey,
    values: createSession.defaults,
    draftsState: ticketFormDraftsState,
  });
  onCreatedRef.current = (ticketId) => {
    if (!isActive()) return;
    clearDraft();
    openRecord(
      { contentType: TICKET_PROPERTY_CONTENT_TYPE, contentId: ticketId },
      { replace: true },
    );
    const acceptedDraft: TTicketDraft = form.getValues();
    acceptedDraft.onComplete?.(ticketId);
  };
  const description = form.watch('description');
  const editorDescription = useRef<string>();
  const restoringEditor = useRef(false);
  const customerId = form.watch('customerId');
  const companyId = form.watch('companyId');
  useEffect(() => {
    if (editorDescription.current === description) return;
    editorDescription.current = description;
    restoringEditor.current = true;
    try {
      const document: unknown = description ? JSON.parse(description) : [];
      editor.replaceBlocks(
        editor.document,
        Array.isArray(document)
          ? [...document, { type: 'paragraph' }]
          : [{ type: 'paragraph', content: description || '' }],
      );
    } catch {
      editor.replaceBlocks(editor.document, [
        { type: 'paragraph', content: description || '' },
      ]);
    } finally {
      restoringEditor.current = false;
    }
  }, [editor, description]);
  const onCancel = () => {
    const discard = () => {
      if (!isActive() || !createSession.discard()) return;
      clearDraft();
      onClose();
    };
    if (isDirty) {
      confirm({ message: t('discard-draft', { keyPrefix: '' }) }).then(
        discard,
        () => undefined,
      );
    } else {
      discard();
    }
  };

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
  } = useTicketCreateFields({ rows, rules, form });

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

  const handleDescriptionChange = () => {
    if (restoringEditor.current) return;
    const nextDescription = JSON.stringify(editor.document.slice(0, -1));
    editorDescription.current = nextDescription;
    form.setValue('description', nextDescription, { shouldDirty: true });
  };

  const onSubmit = (data: TAddTicket) => {
    if (createSession.pending) return;
    const missing = findMissing({
      values: data,
      descriptionEmpty: !description || description === '[]',
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

    const request = createSession.beginSubmission();
    if (!request) return;
    const submittedValues = form.getValues();
    createTicket({
      variables: {
        ...data,
        description: data.description,
        priority: data.priority || 0,
        statusId: data.statusId,
        propertiesData: shownPropertiesData(),
        customerId: data.customerId,
        companyId: data.companyId,
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
          createSession.completeSubmission(
            request,
            data.createTicket._id,
            submittedValues,
          );
        } else {
          createSession.failSubmission(request);
        }
      },
      onError: (error) => {
        createSession.failSubmission(request);
        toast({
          title: t('error', 'Error'),
          description: error.message,
          variant: 'destructive',
        });
      },
    });
  };

  const formContent = (
    <>
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
      {customerId && (
        <PanelFormRow label={t('customer-label', { keyPrefix: '' })}>
          <CustomersInline customerIds={[customerId]} />
        </PanelFormRow>
      )}
      {companyId && (
        <PanelFormRow label={t('company-label', { keyPrefix: '' })}>
          <CompaniesInline companyIds={[companyId]} />
        </PanelFormRow>
      )}
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
    </>
  );

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit, (errors) => {
          const message = Object.values(errors)
            .map((error) => error?.message)
            .find((value): value is string => typeof value === 'string');
          toast({
            title: t('error', 'Error'),
            description: message,
            variant: 'destructive',
          });
        })}
        className="flex flex-1 min-h-0 flex-col"
      >
        <PanelFormLayout
          onCancel={onCancel}
          saving={createSession.pending}
          saveLabel={t('add-ticket', 'Add ticket')}
        >
          {formContent}
        </PanelFormLayout>
      </form>
    </Form>
  );
};
