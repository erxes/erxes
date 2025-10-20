import { useParams } from 'react-router-dom';
import { useGetPipelines } from '@/settings/hooks/useGetPipelines';
import { CreatePipelineForm } from '@/settings/components/pipelines/CreatePipelineForm';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { PIPELINE_FORM_SCHEMA } from '@/settings/schema/pipeline';
import { IPipeline } from '@/channels/types';
import { Form, Button } from 'erxes-ui';

export const PipelineDetail = () => {
  const { pipelineId } = useParams<{ pipelineId: string }>();
  const { pipeline } = useGetPipelines(pipelineId);
  const form = useForm<IPipeline>({
    resolver: zodResolver(PIPELINE_FORM_SCHEMA),
    defaultValues: {
      name: pipeline?.name || '',
      description: pipeline?.description || '',
      channelId: pipeline?.channelId || '',
    },
  });
  console.log(form.control.getFieldState('name'));  
  return (
    <div className="w-full px-4 sm:px-8 lg:px-16">
      <span className="flex justify-between">
        <h1 className="text-2xl font-semibold">{pipeline?.name}</h1>
      </span>
      <div className="mt-4 w-full border border-muted-foreground/15 rounded-md">
        <section className="w-full p-4">
          <form onSubmit={form.handleSubmit((data) => console.log(data))}>
            <Form {...form}>
              <div className="flex flex-col gap-2 ">
                <CreatePipelineForm form={form} />
                <span className="flex justify-end">
                  <Button type="submit">Update</Button>
                </span>
              </div>
            </Form>
          </form>
        </section>
      </div>
      {/* <MemberSection team={team} />
      <EstimateSection team={team} />
      <StatusSection team={team} />
      <CycleSection team={team} />
      <DeleteTeamForm /> */}
    </div>
  );
};
