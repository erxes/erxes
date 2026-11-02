import { TICKET_STATUS_FORM_SCHEMA } from '@/settings/schema/ticketStatus';
import { StatusNameColorField } from '@/status/components/StatusNameColorField';
import { useAddTicketStatus } from '@/status/hooks/useAddTicketStatus';
import { useUpdateTicketStatus } from '@/status/hooks/useUpdateTicketStatus';
import { ITicketStatusDetail } from '@/status/types';
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

export const StatusPanelForm = ({
  editingStatus,
  onClose,
  statusType,
}: {
  editingStatus?: ITicketStatusDetail;
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

  const form = useForm<TStatusForm>({
    resolver: zodResolver(TICKET_STATUS_FORM_SCHEMA),
    defaultValues: {
      name: editingStatus?.name || '',
      description: editingStatus?.description || '',
      color: editingStatus?.color || '#000000',
    },
  });

  useEffect(() => {
    form.setFocus('name');
  }, [form]);

  const onCompleted = () => {
    toast({ title: t('success', 'Success!') });
    onClose();
  };

  const onError = (error: Error) =>
    toast({
      title: t('error', 'Error'),
      description: error.message,
      variant: 'destructive',
    });

  const onSubmit = ({ name, description, color }: TStatusForm) => {
    if (editingStatus) {
      updateStatus({
        variables: {
          id: editingStatus._id,
          name,
          description,
          color: color?.length && color.length > 2 ? color : '',
        },
        onCompleted,
        onError,
      });
      return;
    }

    if (!pipelineId) return;

    addStatus({
      variables: { name, description, color, pipelineId, type: statusType },
      onCompleted,
      onError,
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
          onCancel={onClose}
          cancelLabel={t('cancel', 'Cancel')}
          submitLabel={submitLabel}
          loading={isSaving}
        />
      </form>
    </Form>
  );
};

export const StatusSheet = ({
  editingStatus,
  open,
  statusType,
}: {
  editingStatus?: { _id: string };
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
