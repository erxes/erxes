import { useEffect } from 'react';
import { Form, Sheet, toast } from 'erxes-ui';
import { usePipelineConfigForm } from '../hooks/usePipelineConfigForm';
import { useSaveTicketsConfig } from '../hooks/useSaveTicketsConfig';
import { type SubmitHandler } from 'react-hook-form';
import { type TPipelineConfig } from '@/pipelines/types';
import { useAtom } from 'jotai';
import { configCreateModalAtom, ticketConfigPanelDraftsState } from '../states';
import { ConfigsForm, toPipelineConfigFormValues } from './ConfigsForm';
import { useTranslation } from 'react-i18next';
import { useSidePanel } from 'ui-modules';
import { TICKET_CONFIG_CONTENT_TYPE } from '@/settings/constants/recordPanels';
import { useSettingsParams } from '@/settings/contexts/SettingsPanelContext';
import { SettingsPanelFooter } from '@/settings/components/SettingsPanelForm';
import type { ITicketConfigDetail } from '../hooks/useGetTicketConfigDetail';
import { usePanelFormDraft } from '@/shared/hooks/usePanelFormDraft';

/** Edits a messenger ticket configuration with a restorable panel draft. */
export const TicketConfigEditor = ({
  config,
  onClose,
}: {
  config?: ITicketConfigDetail;
  onClose: () => void;
}) => {
  const { t } = useTranslation('frontline', { keyPrefix: 'modules.pipelines' });
  const { methods } = usePipelineConfigForm();
  const { id: channelId, pipelineId } = useSettingsParams();
  const values: TPipelineConfig = config
    ? toPipelineConfigFormValues(config)
    : {
        name: '',
        channelId: channelId ?? '',
        pipelineId: pipelineId ?? '',
        selectedStatusId: '',
        propertyFields: [],
      };
  const { clearDraft, markSaved, isActive } = usePanelFormDraft({
    form: methods,
    recordKey: config?.id ?? `new~${channelId ?? ''}~${pipelineId ?? ''}`,
    values,
    draftsState: ticketConfigPanelDraftsState,
    isNew: !config,
  });
  /** Discards this configuration draft and closes its editor. */
  const onCancel = () => {
    clearDraft();
    onClose();
  };
  const { saveTicketsConfig, loading } = useSaveTicketsConfig();
  /** Saves the configuration and closes the active draft if no newer edits exist. */
  const onSubmit: SubmitHandler<TPipelineConfig> = (data) => {
    const submittedValues = structuredClone(methods.getValues());
    saveTicketsConfig({
      variables: { input: data },
      onCompleted: () => {
        toast({
          title: t('success', 'Success!'),
          description: t(
            'tickets-config-saved-successfully',
            'Tickets config saved successfully',
          ),
          variant: 'success',
        });
        if (!markSaved(data, submittedValues) || !isActive()) return;
        onClose();
      },
      onError: (error) =>
        toast({
          title: t('error', 'Error'),
          description: error.message,
          variant: 'destructive',
        }),
    });
  };
  useEffect(() => {
    methods.setFocus('name');
  }, [methods]);
  return (
    <Form {...methods}>
      <form
        onSubmit={methods.handleSubmit(onSubmit)}
        className="flex flex-1 min-h-0 flex-col overflow-hidden"
      >
        <Sheet.Content className="flex-1 flex flex-col px-5 py-4 space-y-4 overflow-y-auto styled-scroll">
          <ConfigsForm form={methods} />
        </Sheet.Content>
        <SettingsPanelFooter
          onCancel={onCancel}
          cancelLabel={t('cancel', 'Cancel')}
          submitLabel={config ? t('save', 'Save') : t('add', 'Add')}
          loading={loading}
        />
      </form>
    </Form>
  );
};

export const CreateConfig = () => {
  const [open, setOpen] = useAtom(configCreateModalAtom);
  const { id: channelId, pipelineId } = useSettingsParams();
  const { openRecord, record } = useSidePanel();
  useEffect(() => {
    if (!open || !channelId || !pipelineId) return;
    setOpen(false);
    openRecord(
      {
        contentType: TICKET_CONFIG_CONTENT_TYPE,
        contentId: `new~${channelId}~${pipelineId}`,
      },
      { stack: Boolean(record) },
    );
  }, [channelId, open, openRecord, pipelineId, record, setOpen]);
  return null;
};
