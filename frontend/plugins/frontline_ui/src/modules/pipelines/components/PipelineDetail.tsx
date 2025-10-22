import { useParams } from 'react-router-dom';
import { useGetPipeline } from '@/pipelines/hooks/useGetPipeline';
import { CreatePipelineForm } from '@/pipelines/components/CreatePipelineForm';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { PIPELINE_FORM_SCHEMA } from '@/settings/schema/pipeline';
import { IPipeline } from '@/pipelines/types';
import { Form, Button } from 'erxes-ui';
import { useUpdatePipeline } from '@/pipelines/hooks/useUpdatePipeline';
import { Statuses } from '@/status/components/Statuses';
import { useEffect } from 'react';

export const PipelineDetail = () => {
  const { pipelineId } = useParams<{
    pipelineId: string;
  }>();
  const { pipeline, loading } = useGetPipeline(pipelineId);

  const { updatePipeline } = useUpdatePipeline();

  const form = useForm<IPipeline>({
    resolver: zodResolver(PIPELINE_FORM_SCHEMA),
  });
  useEffect(() => {
    form.reset({
      name: pipeline?.name || '',
      description: pipeline?.description || '',
      _id: pipelineId || '',
    });
  }, [loading]);

  return (
    <div className="w-full px-4 sm:px-8 lg:px-16">
      <span className="flex justify-between">
        <h1 className="text-2xl font-semibold">{pipeline?.name}</h1>
      </span>
      <main className="space-y-6">
        <section className="mt-4 w-full border border-muted-foreground/15 rounded-md">
          <div className="w-full p-4">
            <form
              onSubmit={form.handleSubmit((data) =>
                updatePipeline({ variables: data }),
              )}
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
        <Statuses />
      </main>
    </div>
  );
};
