import { usePanelFormDraft } from '@/shared/hooks/usePanelFormDraft';
import { statusPanelDraftsState } from '@/status/states/statusPanelDrafts';
import { TICKET_STATUS_FORM_SCHEMA } from '@/settings/schema/ticketStatus';
import { StatusNameColorField } from '@/status/components/StatusNameColorField';
import { useAddTicketStatus } from '@/status/hooks/useAddTicketStatus';
import { useUpdateTicketStatus } from '@/status/hooks/useUpdateTicketStatus';
import { ITicketStatus } from '@/status/types';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, Sheet, Textarea, useToast } from 'erxes-ui';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useSettingsParams } from '@/settings/contexts/SettingsPanelContext';
import { SettingsPanelFooter } from '@/settings/components/SettingsPanelForm';
import { TICKET_STATUS_CONTENT_TYPE } from '@/settings/constants/recordPanels';
import {
  addingStatusState,
  editingStatusState,
} from '@/settings/states/StatusStates';
import { useSetAtom } from 'jotai';
import { useSidePanel } from 'ui-modules';
import { z } from 'zod';

type TStatusForm = z.infer<typeof TICKET_STATUS_FORM_SCHEMA>;

/** Validates and saves a new or existing ticket status in the settings panel. */
export const StatusPanelForm = ({
  editingStatus,
  onClose,
  statusType,
}: {
  editingStatus?: ITicketStatus;
  onClose: () => void;
  statusType: number;
}) => {
  const { t } = useTranslation('frontline', { keyPrefix: 'modules.status' });
  const { toast } = useToast();
  const { pipelineId } = useSettingsParams();
  const { addStatus, loading: adding } = useAddTicketStatus();
  const { updateStatus, loading: updating } = useUpdateTicketStatus();

  const isEditing = Boolean(editingStatus);
  const isSaving = adding || updating;
  const submitLabel = isEditing ? t('update', 'Update') : t('save', 'Save');

  const values: TStatusForm = {
    name: editingStatus?.name || '',
    description: editingStatus?.description || '',
    color: editingStatus?.color || '#000000',
  };
  const form = useForm<TStatusForm>({
    resolver: zodResolver(TICKET_STATUS_FORM_SCHEMA),
    defaultValues: values,
  });
  const { clearDraft, markSaved, isActive, beginSave, endSave, saving } =
    usePanelFormDraft({
      form,
      recordKey: editingStatus?._id ?? `new~${pipelineId ?? ''}~${statusType}`,
      values,
      draftsState: statusPanelDraftsState,
      isNew: !editingStatus,
    });
  const cancel = () => {
    clearDraft();
    onClose();
  };

  useEffect(() => {
    form.setFocus('name');
  }, [form]);

  /** Displays the status mutation's error message. */
  const onError = (error: Error) =>
    toast({
      title: t('error', 'Error'),
      description: error.message,
      variant: 'destructive',
    });

  /** Updates the selected status or creates one in the current pipeline. */
  const onSubmit = (data: TStatusForm) => {
    if (!editingStatus && !pipelineId) return undefined;
    const saveId = beginSave();
    if (saveId === undefined) return undefined;
    const submittedValues = structuredClone(form.getValues());
    const { name, description, color } = data;
    const onCompleted = () => {
      endSave(saveId);
      toast({ title: t('success', 'Success!') });
      if (markSaved(data, submittedValues) && isActive()) onClose();
    };
    const handleError = (error: Error) => {
      endSave(saveId);
      onError(error);
    };
    if (editingStatus) {
      return updateStatus({
        variables: {
          id: editingStatus._id,
          name,
          description,
          color: color?.length && color.length > 2 ? color : '',
        },
        onCompleted,
        onError: handleError,
      });
    }

    if (!pipelineId) {
      endSave(saveId);
      return undefined;
    }

    return addStatus({
      variables: { name, description, color, pipelineId, type: statusType },
      onCompleted,
      onError: handleError,
    });
  };

  return (
    <Form {...form}>
      <form
        className="box-border flex size-full flex-col overflow-hidden"
        onSubmit={form.handleSubmit(onSubmit, (errors) => {
          toast({
            title: t('error', 'Error'),
            description: Object.values(errors)[0]?.message,
            variant: 'destructive',
          });
        })}
      >
        <Sheet.Content className="flex flex-1 flex-col gap-4 overflow-y-auto px-5 py-4">
          <StatusNameColorField form={form} statusType={statusType} />
          <Form.Field
            control={form.control}
            name="description"
            render={({ field }) => (
              <Form.Item>
                <Form.Label>{t('description', 'Description')}</Form.Label>
                <Form.Control>
                  <Textarea
                    className="min-h-24 resize-none"
                    placeholder={t('description', 'Description')}
                    {...field}
                  />
                </Form.Control>
                <Form.Message />
              </Form.Item>
            )}
          />
        </Sheet.Content>
        <SettingsPanelFooter
          onCancel={cancel}
          cancelLabel={t('cancel', 'Cancel')}
          submitLabel={submitLabel}
          loading={isSaving || saving}
        />
      </form>
    </Form>
  );
};

/** Opens a scoped record panel from status creation or editing state. */
export const StatusSheet = ({
  editingStatus,
  open,
  statusType,
}: {
  editingStatus?: ITicketStatus;
  open: boolean;
  statusType: number;
}) => {
  const { pipelineId } = useSettingsParams();
  const { openRecord, record } = useSidePanel();
  const setAdding = useSetAtom(addingStatusState);
  const setEditing = useSetAtom(editingStatusState);
  useEffect(() => {
    if (!open || !pipelineId) return;
    const contentId = editingStatus?._id ?? `new~${pipelineId}~${statusType}`;
    setAdding(null);
    setEditing(null);
    if (
      record?.contentType === TICKET_STATUS_CONTENT_TYPE &&
      record.contentId === contentId
    )
      return;
    openRecord(
      { contentType: TICKET_STATUS_CONTENT_TYPE, contentId },
      { stack: Boolean(record) },
    );
  }, [
    editingStatus,
    open,
    openRecord,
    pipelineId,
    record,
    setAdding,
    setEditing,
    statusType,
  ]);
  return null;
};
