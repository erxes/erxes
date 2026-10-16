import { TICKET_STATUS_FORM_SCHEMA } from '@/settings/schema/ticketStatus';
import {
  addingStatusState,
  editingStatusState,
} from '@/settings/states/StatusStates';
import { StatusNameColorField } from '@/status/components/StatusNameColorField';
import { useAddTicketStatus } from '@/status/hooks/useAddTicketStatus';
import { useUpdateTicketStatus } from '@/status/hooks/useUpdateTicketStatus';
import { ITicketStatus } from '@/status/types';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Button,
  Form,
  Sheet,
  Spinner,
  Textarea,
  useToast,
} from 'erxes-ui';
import { useSetAtom } from 'jotai';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { z } from 'zod';

type TStatusForm = z.infer<typeof TICKET_STATUS_FORM_SCHEMA>;

const StatusSheetForm = ({
  editingStatus,
  onClose,
  statusType,
}: {
  editingStatus?: ITicketStatus;
  onClose: () => void;
  statusType: number;
}) => {
  const { t } = useTranslation('frontline');
  const { toast } = useToast();
  const { pipelineId } = useParams<{ pipelineId: string }>();
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
        <Sheet.Header>
          <Sheet.Title className="capitalize">
            {editingStatus ? editingStatus.name : t('status', 'Status')}
          </Sheet.Title>
          <Sheet.Description className="sr-only">
            {t('manage-ticket-statuses', 'Manage ticket statuses')}
          </Sheet.Description>
          <Sheet.Close />
        </Sheet.Header>
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
        <Sheet.Footer className="shrink-0">
          <Button
            disabled={isSaving}
            onClick={onClose}
            type="button"
            variant="ghost"
          >
            {t('cancel', 'Cancel')}
          </Button>
          <Button disabled={isSaving} type="submit">
            {isSaving ? <Spinner /> : submitLabel}
          </Button>
        </Sheet.Footer>
      </form>
    </Form>
  );
};

export const StatusSheet = ({
  editingStatus,
  open,
  statusType,
}: {
  editingStatus?: ITicketStatus;
  open: boolean;
  statusType: number;
}) => {
  const setAddingStatus = useSetAtom(addingStatusState);
  const setEditingStatus = useSetAtom(editingStatusState);

  const handleClose = () => {
    setAddingStatus(null);
    setEditingStatus(null);
  };

  return (
    <Sheet open={open} onOpenChange={(nextOpen) => !nextOpen && handleClose()}>
      <Sheet.View className="p-0 sm:max-w-md">
        {open && (
          <StatusSheetForm
            editingStatus={editingStatus}
            onClose={handleClose}
            statusType={statusType}
          />
        )}
      </Sheet.View>
    </Sheet>
  );
};
