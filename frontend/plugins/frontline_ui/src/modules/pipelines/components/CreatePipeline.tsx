import { usePanelFormDraft } from '@/shared/hooks/usePanelFormDraft';
import { pipelineCreatePanelDraftsState } from '@/pipelines/states/pipelineStates';
import { IconPlus } from '@tabler/icons-react';
import {
  Button,
  Form,
  Kbd,
  usePreviousHotkeyScope,
  useScopedHotkeys,
  useToast,
} from 'erxes-ui';
import { usePipelineAdd } from '@/pipelines/hooks/useAddPipeline';
import { useForm } from 'react-hook-form';
import { CREATE_PIPELINE_FORM_SCHEMA } from '@/settings/schema/pipeline';
import { zodResolver } from '@hookform/resolvers/zod';
import { TCreatePipelineForm } from '@/pipelines/types';
import { PipelineHotkeyScope } from '@/pipelines/types/PipelineHotkeyScope';
import { CreatePipelineForm } from './CreatePipelineForm';
import { useTranslation } from 'react-i18next';
import { useSidePanel } from 'ui-modules';
import { PIPELINE_CONTENT_TYPE } from '@/settings/constants/recordPanels';
import { useSettingsParams } from '@/settings/contexts/SettingsPanelContext';
import { SettingsPanelFooter } from '@/settings/components/SettingsPanelForm';
import { getPipelineDraftId } from '@/pipelines/constants/pipelineTabs';
import { useEffect } from 'react';

/** Creates a pipeline within the selected channel's settings panel. */
export const CreatePipelinePanelForm = ({
  channelId,
}: {
  channelId: string;
}) => {
  const { t } = useTranslation('frontline', { keyPrefix: 'modules.pipelines' });
  const { toast } = useToast();
  const { close, openRecord } = useSidePanel();
  const { addPipeline, loading } = usePipelineAdd();
  const {
    setHotkeyScopeAndMemorizePreviousScope,
    goBackToPreviousHotkeyScope,
  } = usePreviousHotkeyScope();
  useEffect(() => {
    setHotkeyScopeAndMemorizePreviousScope(
      PipelineHotkeyScope.PipelineAddSheet,
    );
    return goBackToPreviousHotkeyScope;
  }, [setHotkeyScopeAndMemorizePreviousScope, goBackToPreviousHotkeyScope]);
  useScopedHotkeys('esc', close, PipelineHotkeyScope.PipelineAddSheet);
  const values: TCreatePipelineForm = { name: '', description: '', channelId };
  const form = useForm<TCreatePipelineForm>({
    resolver: zodResolver(CREATE_PIPELINE_FORM_SCHEMA),
    defaultValues: values,
  });

  const { clearDraft, markSaved, isActive, beginSave, endSave, saving } =
    usePanelFormDraft({
      form,
      recordKey: getPipelineDraftId(channelId),
      values,
      draftsState: pipelineCreatePanelDraftsState,
      isNew: true,
    });
  /** Discards the retained pipeline draft and closes its creation panel. */
  const cancel = () => {
    clearDraft();
    close();
  };

  /** Saves the pipeline and replaces its draft panel with the saved record. */
  const submit = (data: TCreatePipelineForm) => {
    const saveId = beginSave();
    if (saveId === undefined) return undefined;
    const submittedValues = structuredClone(form.getValues());
    return addPipeline({
      variables: { ...data, channelId },
      onCompleted: ({ createPipeline }) => {
        endSave(saveId);
        toast({ title: t('success', 'Success!') });
        if (!markSaved(data, submittedValues) || !isActive()) return;
        if (!createPipeline) {
          close();
          return;
        }
        openRecord(
          { contentType: PIPELINE_CONTENT_TYPE, contentId: createPipeline._id },
          { replace: true },
        );
      },
      onError: (error) => {
        endSave(saveId);
        toast({
          title: t('error', 'Error'),
          description: error.message,
          variant: 'destructive',
        });
      },
    });
  };

  return (
    <Form {...form}>
      <form
        className="flex min-h-0 flex-1 flex-col"
        onSubmit={form.handleSubmit(submit)}
      >
        <div className="flex-1 overflow-auto p-3">
          <CreatePipelineForm form={form} />
        </div>
        <SettingsPanelFooter
          onCancel={cancel}
          cancelLabel={t('cancel', 'Cancel')}
          submitLabel={t('create', 'Create')}
          loading={loading || saving}
        />
      </form>
    </Form>
  );
};

/** Provides the pipeline create button and its scoped shortcut. */
export const CreatePipeline = () => {
  const { t } = useTranslation('frontline', { keyPrefix: 'modules.pipelines' });
  const { id: channelId } = useSettingsParams();
  const { openRecord } = useSidePanel();
  /** Opens a pipeline draft scoped to the current settings channel. */
  const open = () => {
    if (!channelId) return;
    openRecord({
      contentType: PIPELINE_CONTENT_TYPE,
      contentId: getPipelineDraftId(channelId),
    });
  };
  useScopedHotkeys('c', open, PipelineHotkeyScope.PipelineSettingsPage);

  if (!channelId) return null;

  return (
    <Button onClick={open}>
      <IconPlus />
      {t('create-pipeline', 'Create pipeline')}
      <Kbd>C</Kbd>
    </Button>
  );
};
