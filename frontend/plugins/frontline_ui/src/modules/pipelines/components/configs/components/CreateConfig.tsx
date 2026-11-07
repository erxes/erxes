import { useEffect } from 'react';
import { Form, Sheet, isDeeplyEqual, toast, useConfirm } from 'erxes-ui';
import { useApolloClient } from '@apollo/client';
import { GET_TICKET_CONFIG_BY_PIPELINE_ID } from '../graphql/queries/getTicketConfigBetPipelineId';
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
  const client = useApolloClient();
  const { confirm } = useConfirm();
  const { openRecord } = useSidePanel();
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
  const {
    clearDraft,
    markSaved,
    isActive,
    captureUpdate,
    beginSave,
    endSave,
    saving,
  } = usePanelFormDraft({
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
  const onSubmit: SubmitHandler<TPipelineConfig> = async (data) => {
    const saveId = beginSave();
    if (saveId === undefined) return;
    const submittedValues = structuredClone(methods.getValues());
    const defaults = structuredClone(methods.formState.defaultValues);
    const completeDraft = !config ? captureUpdate() : undefined;
    const onError = (error: unknown) =>
      toast({
        title: t('error', 'Error'),
        description: error instanceof Error ? error.message : String(error),
        variant: 'destructive',
      });
    const persist = async () => {
      const requestId = beginSave();
      if (requestId === undefined) return;
      try {
        await saveTicketsConfig({
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
            if (config) {
              if (markSaved(data, submittedValues) && isActive()) onClose();
            } else {
              completeDraft?.(() => values);
              markSaved(values);
              if (isActive()) onClose();
            }
          },
          onError: (error) => {
            completeDraft?.((latest) => latest);
            onError(error);
          },
        });
      } catch (error) {
        completeDraft?.((latest) => latest);
        onError(error);
      } finally {
        endSave(requestId);
      }
    };
    try {
      const { data: latest } = await client.query({
        query: GET_TICKET_CONFIG_BY_PIPELINE_ID,
        variables: { pipelineId: data.pipelineId },
        fetchPolicy: 'no-cache',
      });
      const current = latest?.ticketConfig;
      if (!config && current) {
        completeDraft?.((latest) => latest);
        clearDraft();
        if (isActive())
          openRecord(
            { contentType: TICKET_CONFIG_CONTENT_TYPE, contentId: current.id },
            { replace: true },
          );
        return;
      }
      if (config && (!current || current.id !== config.id)) {
        throw new Error(t('not-found', { keyPrefix: '' }));
      }
      endSave(saveId);
      if (
        current &&
        !isDeeplyEqual(toPipelineConfigFormValues(current), defaults, {
          strict: true,
        })
      ) {
        confirm({
          message: t(
            'configuration-changed-confirm',
            'This configuration has changed since you started editing. Replace the latest configuration with your draft?',
          ),
        }).then(() => {
          if (isActive()) persist();
        });
        return;
      }
      await persist();
    } catch (error) {
      completeDraft?.((latest) => latest);
      onError(error);
    } finally {
      endSave(saveId);
    }
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
          loading={loading || saving}
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
