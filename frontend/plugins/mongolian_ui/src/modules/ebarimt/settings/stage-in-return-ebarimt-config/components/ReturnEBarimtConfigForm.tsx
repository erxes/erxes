import { Button, Form, Input } from 'erxes-ui';
import { SelectSalesBoard } from '@/ebarimt/settings/stage-in-return-ebarimt-config/components/selects/SelectSalesBoard';
import { SelectPipeline } from '@/ebarimt/settings/stage-in-return-ebarimt-config/components/selects/SelectPipeline';
import { SelectStage } from '@/ebarimt/settings/stage-in-return-ebarimt-config/components/selects/SelectStage';
import { useCreateEbarimtReturnConfig } from '@/ebarimt/settings/stage-in-return-ebarimt-config/hooks/useCreateEbarimtReturnConfig';
import { ReturnEbarimtConfig } from '@/ebarimt/settings/stage-in-return-ebarimt-config/types';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { addEBarimtReturnConfigSchema } from '@/ebarimt/settings/stage-in-return-ebarimt-config/types/addEBarimtReturnConfigSchema';
import { useQuery } from '@apollo/client';
import { GET_CONFIGS_GET_VALUE } from '@/ebarimt/settings/stage-in-return-ebarimt-config/graphql/queries/useStageInEBarimtConfigQuery';

const defaultValues = {
  title: '',
  destinationStageBoard: '',
  pipelineId: '',
  stageId: '',
  userEmail: '',
  hasVat: false,
  hasCitytax: false,
};

const EditConfigForm = ({ config, onNewConfig, onSubmit, loading }: any) => {
  const form = useForm({
    resolver: zodResolver(addEBarimtReturnConfigSchema),
    defaultValues: {
      title: config?.title || '',
      destinationStageBoard: config?.destinationStageBoard || '',
      pipelineId: config?.pipelineId || '',
      stageId: config?.stageId || '',
      userEmail: config?.userEmail || '',
      hasVat: config?.hasVat || false,
      hasCitytax: config?.hasCitytax || false,
    },
  });

  const selectedBoardId = form.watch('destinationStageBoard');
  const selectedPipelineId = form.watch('pipelineId');

  return (
    <div className="">
      <Form {...form}>
        <form
          className="h-full w-full mx-auto max-w-2xl px-9 py-5 flex flex-col gap-6"
          onSubmit={form.handleSubmit(onSubmit)}
        >
          <div className="flex justify-between items-center">
            <h1 className="text-lg font-semibold">Return Ebarimt Config</h1>
            <Button type="button" onClick={onNewConfig}>
              New Config
            </Button>
          </div>

          <Form.Field
            name="title"
            control={form.control}
            render={({ field }) => (
              <Form.Item>
                <Form.Label>Title</Form.Label>
                <Form.Control>
                  <Input {...field} placeholder="Title" />
                </Form.Control>
                <Form.Message />
              </Form.Item>
            )}
          />

          <div className="grid grid-cols-1 gap-4">
            <Form.Field
              control={form.control}
              name="destinationStageBoard"
              render={({ field }) => (
                <Form.Item>
                  <Form.Label>Destination Stage Board</Form.Label>
                  <SelectSalesBoard
                    value={field.value}
                    onValueChange={(value) => {
                      field.onChange(value);
                      form.setValue('pipelineId', '');
                      form.setValue('stageId', '');
                    }}
                  />
                  <Form.Message />
                </Form.Item>
              )}
            />

            <Form.Field
              control={form.control}
              name="pipelineId"
              render={({ field }) => (
                <Form.Item>
                  <Form.Label>Pipeline</Form.Label>
                  <SelectPipeline
                    value={field.value}
                    onValueChange={(value) => {
                      field.onChange(value);
                      form.setValue('stageId', '');
                    }}
                    boardId={selectedBoardId}
                    disabled={!selectedBoardId}
                  />
                  <Form.Message />
                </Form.Item>
              )}
            />

            <Form.Field
              control={form.control}
              name="stageId"
              render={({ field }) => (
                <Form.Item>
                  <Form.Label>Stage</Form.Label>
                  <SelectStage
                    id="stageId"
                    variant="form"
                    value={field.value}
                    onValueChange={field.onChange}
                    pipelineId={selectedPipelineId}
                    disabled={!selectedPipelineId}
                  />
                  <Form.Message />
                </Form.Item>
              )}
            />
          </div>

          <div className="flex justify-end">
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

const NewConfigForm = ({
  onCancel,
  onSubmit,
  loading,
}: {
  onCancel: () => void;
  onSubmit: (data: any) => void;
  loading: boolean;
}) => {
  const form = useForm({
    resolver: zodResolver(addEBarimtReturnConfigSchema),
    defaultValues,
  });

  const selectedBoardId = form.watch('destinationStageBoard');
  const selectedPipelineId = form.watch('pipelineId');

  return (
    <div className="">
      <Form {...form}>
        <form
          className="w-full mx-auto max-w-2xl flex flex-col gap-6 px-9 py-5"
          onSubmit={form.handleSubmit(onSubmit)}
        >
          <h1 className="text-lg font-semibold">Return Ebarimt Config</h1>

          <Form.Field
            name="title"
            control={form.control}
            render={({ field }) => (
              <Form.Item>
                <Form.Label>Title</Form.Label>
                <Form.Control>
                  <Input {...field} placeholder="Title" />
                </Form.Control>
                <Form.Message />
              </Form.Item>
            )}
          />

          <div className="grid grid-cols-1 gap-4">
            <Form.Field
              control={form.control}
              name="destinationStageBoard"
              render={({ field }) => (
                <Form.Item>
                  <Form.Label>Destination Stage Board</Form.Label>
                  <SelectSalesBoard
                    value={field.value}
                    onValueChange={(value) => {
                      field.onChange(value);
                      form.setValue('pipelineId', '');
                      form.setValue('stageId', '');
                    }}
                  />
                  <Form.Message />
                </Form.Item>
              )}
            />

            <Form.Field
              control={form.control}
              name="pipelineId"
              render={({ field }) => (
                <Form.Item>
                  <Form.Label>Pipeline</Form.Label>
                  <SelectPipeline
                    value={field.value}
                    onValueChange={(value) => {
                      field.onChange(value);
                      form.setValue('stageId', '');
                    }}
                    boardId={selectedBoardId}
                    disabled={!selectedBoardId}
                  />
                  <Form.Message />
                </Form.Item>
              )}
            />

            <Form.Field
              control={form.control}
              name="stageId"
              render={({ field }) => (
                <Form.Item>
                  <Form.Label>Stage</Form.Label>
                  <SelectStage
                    id="stageId"
                    variant="form"
                    value={field.value}
                    onValueChange={field.onChange}
                    pipelineId={selectedPipelineId}
                    disabled={!selectedPipelineId}
                  />
                  <Form.Message />
                </Form.Item>
              )}
            />
          </div>

          <div className="flex justify-end gap-2 mt-6">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export const ReturnEbarimtConfigForm = () => {
  const [showNewConfig, setShowNewConfig] = useState(false);
  const { createEbarimtReturnConfig, loading: createLoading } =
    useCreateEbarimtReturnConfig();
  const { data, refetch, loading } = useQuery(GET_CONFIGS_GET_VALUE, {
    variables: { code: 'returnStageInEbarimt' },
    fetchPolicy: 'network-only',
  });

  const configValue = data?.configsGetValue?.value;
  const parsedConfig = configValue
    ? typeof configValue === 'string'
      ? JSON.parse(configValue)
      : configValue
    : null;

  const handleSubmit = async (formData: ReturnEbarimtConfig) => {
    try {
      const configsMapString = {
        returnStageInEbarimt: {
          title: formData.title,
          destinationStageBoard: formData.destinationStageBoard,
          pipelineId: formData.pipelineId,
          stageId: formData.stageId,
          userEmail: formData.userEmail || '',
          hasVat: formData.hasVat || false,
          hasCitytax: formData.hasCitytax || false,
        },
      };

      await createEbarimtReturnConfig({
        variables: {
          configsMap: configsMapString,
        },
      });

      await refetch();

      setShowNewConfig(false);
    } catch (error) {
      console.error('Error saving config:', error);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="h-full w-full mx-auto max-w-2xl flex flex-col">
      {!parsedConfig || showNewConfig ? (
        <NewConfigForm
          onCancel={() => {
            if (parsedConfig) {
              setShowNewConfig(false);
            }
          }}
          onSubmit={handleSubmit}
          loading={createLoading}
        />
      ) : (
        <EditConfigForm
          config={parsedConfig}
          onNewConfig={() => setShowNewConfig(true)}
          onSubmit={handleSubmit}
          loading={createLoading}
        />
      )}
    </div>
  );
};
