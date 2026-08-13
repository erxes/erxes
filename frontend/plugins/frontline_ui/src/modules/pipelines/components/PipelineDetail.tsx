import { useParams } from 'react-router-dom';
import { useGetPipeline } from '@/pipelines/hooks/useGetPipeline';
import { CreatePipelineForm } from '@/pipelines/components/CreatePipelineForm';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { UPDATE_PIPELINE_FORM_SCHEMA } from '@/settings/schema/pipeline';
import { Button, Form, Spinner, toast } from 'erxes-ui';
import { useUpdatePipeline } from '@/pipelines/hooks/useUpdatePipeline';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { TUpdatePipelineForm } from '@/pipelines/types';
import { PipelineConfig } from '@/pipelines/components/PipelineConfig';

export const PipelineDetail = () => {
  const { t } = useTranslation('frontline');
  const { pipelineId } = useParams<{
    pipelineId: string;
  }>();
  const { pipeline } = useGetPipeline(pipelineId);
  const { updatePipeline, loading: updating } = useUpdatePipeline();

  const form = useForm<TUpdatePipelineForm>({
    resolver: zodResolver(UPDATE_PIPELINE_FORM_SCHEMA),
    defaultValues: {
      _id: pipelineId,
    },
  });

  useEffect(() => {
    form.reset({
      name: pipeline?.name || '',
      description: pipeline?.description || '',
      _id: pipelineId || '',
      numberConfig: pipeline?.numberConfig || '',
      numberSize: pipeline?.numberSize || '',
      nameConfig: pipeline?.nameConfig || '',
      propertyIds: pipeline?.propertyIds || [],
    });
  }, [form, pipeline, pipelineId]);

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit((data) => {
          updatePipeline({
            variables: data,
            onCompleted: () => {
              toast({ title: t('success'), variant: 'success' });
            },
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
          <Button disabled={updating} type="submit">
            {updating ? <Spinner /> : t('update')}
          </Button>
        </div>
      </form>
    </Form>
  );
};
