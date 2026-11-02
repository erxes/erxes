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
  const form = useForm<TCreatePipelineForm>({
    resolver: zodResolver(CREATE_PIPELINE_FORM_SCHEMA),
    defaultValues: { name: '', description: '', channelId },
  });

  const submit = (data: TCreatePipelineForm) => {
    addPipeline({
      variables: { ...data, channelId },
      awaitRefetchQueries: true,
      onCompleted: ({ createPipeline }) => {
        if (!createPipeline) return;
        form.reset();
        toast({ title: t('success', 'Success!') });
        openRecord(
          { contentType: PIPELINE_CONTENT_TYPE, contentId: createPipeline._id },
          { replace: true },
        );
      },
      onError: (error) =>
        toast({
          title: t('error', 'Error'),
          description: error.message,
          variant: 'destructive',
        }),
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
          onCancel={close}
          cancelLabel={t('cancel', 'Cancel')}
          submitLabel={t('create', 'Create')}
          loading={loading}
        />
      </form>
    </Form>
  );
};

export const CreatePipeline = () => {
  const { t } = useTranslation('frontline', { keyPrefix: 'modules.pipelines' });
  const { id: channelId } = useSettingsParams();
  const { openRecord } = useSidePanel();
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
