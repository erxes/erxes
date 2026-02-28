import { useParams } from 'react-router-dom';
import { useGetPipeline } from '@/pipelines/hooks/useGetPipeline';
import { CreatePipelineForm } from '@/pipelines/components/CreatePipelineForm';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { UPDATE_PIPELINE_FORM_SCHEMA } from '@/settings/schema/pipeline';
import { Form, Button, Skeleton, Spinner } from 'erxes-ui';
import { useUpdatePipeline } from '@/pipelines/hooks/useUpdatePipeline';
import { useEffect } from 'react';
import { TUpdatePipelineForm } from '@/pipelines/types';
import { PipelineConfigs } from './configs/components/PipelineConfigs';
import { TicketStatusesButton } from '@/status/components/TicketStatusesButton';
import { PipelinePermissions } from '@/pipelines/components/permissions/components/PipelinePermissions';

export const PipelineDetail = () => {
  const { pipelineId } = useParams<{
    pipelineId: string;
  }>();
  const { pipeline, loading } = useGetPipeline(pipelineId);
  const { updatePipeline } = useUpdatePipeline();

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
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pipeline]);
  if (loading) {
    <Spinner />;
  }
  return (
    <div className="w-full px-4 sm:px-8 lg:px-16">
      <span className="flex justify-between">
        <h1 className="text-2xl font-semibold">
          {loading ? <Skeleton className="w-32 h-5" /> : pipeline?.name}
        </h1>
      </span>
      <main className="space-y-6 pb-10">
        <section className="mt-4 w-full border border-muted-foreground/15 rounded-md">
          <div className="w-full p-4">
            <form
              onSubmit={form.handleSubmit((data) => {
                updatePipeline({ variables: data });
              })}
            >
              <Form {...form}>
                <div className="flex flex-col gap-2 ">
                  <CreatePipelineForm form={form} />
                  <span className="flex justify-end">
                    <Button type="submit">Update</Button>
                  </span>
                </div>
              </Form>
            </form>
          </div>
        </section>
        <TicketStatusesButton />
        <PipelinePermissions />
        <PipelineConfigs />
      </main>
    </div>
  );
};
