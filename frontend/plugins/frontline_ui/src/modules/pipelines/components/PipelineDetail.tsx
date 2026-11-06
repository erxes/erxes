import { usePanelFormDraft } from '@/shared/hooks/usePanelFormDraft';
import { pipelinePanelDraftsState } from '@/pipelines/states/pipelineStates';
import { useSettingsParams } from '@/settings/contexts/SettingsPanelContext';
import { useGetPipeline } from '@/pipelines/hooks/useGetPipeline';
import { CreatePipelineForm } from '@/pipelines/components/CreatePipelineForm';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { UPDATE_PIPELINE_FORM_SCHEMA } from '@/settings/schema/pipeline';
import { Button, Form, Spinner, toast } from 'erxes-ui';
import { useUpdatePipeline } from '@/pipelines/hooks/useUpdatePipeline';
import { useTranslation } from 'react-i18next';
import { TUpdatePipelineForm } from '@/pipelines/types';
import { PipelineConfig } from '@/pipelines/components/PipelineConfig';

export const PipelineDetail = () => {
  const { t } = useTranslation('frontline', { keyPrefix: 'modules.pipelines' });
  const { pipelineId } = useSettingsParams();
  const { pipeline } = useGetPipeline(pipelineId);
  const { updatePipeline, loading: updating } = useUpdatePipeline();

  const values: TUpdatePipelineForm = {
    name: pipeline?.name || '',
    description: pipeline?.description || '',
    _id: pipelineId || '',
    numberConfig: pipeline?.numberConfig || '',
    numberSize: pipeline?.numberSize || '',
    nameConfig: pipeline?.nameConfig || '',
  };
  const form = useForm<TUpdatePipelineForm>({
    resolver: zodResolver(UPDATE_PIPELINE_FORM_SCHEMA),
    defaultValues: values,
  });
  const { dirtyFields } = form.formState;
  const { markSaved, beginSave, endSave, saving } = usePanelFormDraft({
    form,
    recordKey: pipelineId || '',
    values,
    draftsState: pipelinePanelDraftsState,
  });

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit((data) => {
          const saveId = beginSave();
          if (saveId === undefined) return undefined;
          const submittedValues = structuredClone(form.getValues());
          return updatePipeline({
            variables: {
              _id: data._id,
              ...Object.fromEntries(
                Object.entries(data).filter(([key]) =>
                  Object.keys(dirtyFields).includes(key),
                ),
              ),
            },
            onCompleted: () => {
              endSave(saveId);
              markSaved(data, submittedValues);
              toast({ title: t('success', 'Success!'), variant: 'success' });
            },
            onError: () => endSave(saveId),
          });
        })}
      >
        <div className="flex flex-col divide-y">
          <section className="py-5 first:pt-0">
            <CreatePipelineForm form={form} />
          </section>
          <PipelineConfig form={form} />
        </div>
        <div className="mt-5 flex justify-end border-t pt-5">
          <Button disabled={updating || saving} type="submit">
            {updating ? <Spinner /> : t('update', 'Update')}
          </Button>
        </div>
      </form>
    </Form>
  );
};
