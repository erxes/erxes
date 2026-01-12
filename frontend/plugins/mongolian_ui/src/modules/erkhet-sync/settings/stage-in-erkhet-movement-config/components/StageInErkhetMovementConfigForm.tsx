import { Button, Form, Input, Select } from 'erxes-ui';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery } from '@apollo/client';
import { SelectPipeline } from './selects/SelectPipeline';
import { SelectStage } from './selects/SelectStage';
import { CHOOSE_RESPONSE_FIELD_DATA } from '../constants/chooseResponseFieldData';
import { useCreateStageInErkhetMovementConfig } from '../hooks/useCreateStageInErkhetMovementConfig';
import { TMovementErkhetConfig } from '../types';
import { SelectSalesBoard } from './selects/SelectBoard';
import { addStageInMovementErkhetConfigSchema } from '../constants/addStageInErkhetMovementConfigSchema';
import { GET_CONFIGS_GET_VALUE } from '../graphql/queries/useStageInErkhetMovementConfigQuery';

const defaultValues = {
  title: '',
  boardId: '',
  pipelineId: '',
  stageId: '',
  userEmail: '',
  chooseResponseField: '',
  defaultCustomer: '',
};

const EditConfigForm = ({ config, onNewConfig, onSubmit, loading }: any) => {
  const form = useForm({
    resolver: zodResolver(addStageInMovementErkhetConfigSchema),
    defaultValues: {
      title: config?.title || '',
      boardId: config?.boardId || '',
      pipelineId: config?.pipelineId || '',
      stageId: config?.stageId || '',
      userEmail: config?.userEmail || '',
      chooseResponseField: config?.chooseResponseField || '',
      defaultCustomer: config?.defaultCustomer || '',
    },
  });

  const selectedBoardId = form.watch('boardId');
  const selectedPipelineId = form.watch('pipelineId');

  return (
    <div className="">
      <Form {...form}>
        <form
          className="h-full w-full mx-auto max-w-6xl px-9 py-5 flex flex-col gap-6"
          onSubmit={form.handleSubmit(onSubmit)}
        >
          <div className="flex justify-between items-center">
            <h1 className="text-lg font-semibold">New Erkhet Move Config</h1>
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

          <div className="grid grid-cols-2 gap-4">
            <div className="grid grid-cols-1 gap-4">
              <Form.Field
                control={form.control}
                name="boardId"
                render={({ field }) => (
                  <Form.Item>
                    <Form.Label>Board</Form.Label>
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
            <div className="grid grid-cols-1 gap-4">
              <Form.Field
                name="userEmail"
                control={form.control}
                render={({ field }) => (
                  <Form.Item>
                    <Form.Label>User Email</Form.Label>
                    <Form.Control>
                      <Input {...field} placeholder="User Email" />
                    </Form.Control>
                    <Form.Message />
                  </Form.Item>
                )}
              />
              <Form.Field
                control={form.control}
                name="defaultCustomer"
                render={({ field }) => (
                  <Form.Item>
                    <Form.Label>Default Customer</Form.Label>
                    <Form.Control>
                      <Input {...field} placeholder="Default Customer" />
                    </Form.Control>
                    <Form.Message />
                  </Form.Item>
                )}
              />
              <Form.Field
                control={form.control}
                name="chooseResponseField"
                render={({ field }) => (
                  <Form.Item className="w-full">
                    <Form.Label>Choose Response Field</Form.Label>
                    <Select
                      value={field.value}
                      onValueChange={(value) => {
                        field.onChange(value);
                      }}
                    >
                      <Select.Trigger className="w-full">
                        <Select.Value placeholder="Choose Response Field" />
                      </Select.Trigger>
                      <Select.Content>
                        {CHOOSE_RESPONSE_FIELD_DATA.map((type) => (
                          <Select.Item key={type.value} value={type.value}>
                            {type.label}
                          </Select.Item>
                        ))}
                      </Select.Content>
                    </Select>
                    <Form.Message />
                  </Form.Item>
                )}
              />
            </div>
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
    resolver: zodResolver(addStageInMovementErkhetConfigSchema),
    defaultValues,
  });

  const selectedBoardId = form.watch('boardId');
  const selectedPipelineId = form.watch('pipelineId');

  return (
    <div className="">
      <Form {...form}>
        <form
          className="w-full mx-auto max-w-6xl flex flex-col gap-6 px-9 py-5"
          onSubmit={form.handleSubmit(onSubmit)}
        >
          <h1 className="text-lg font-semibold">New Erkhet Move Config</h1>

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

          <div className="grid grid-cols-2 gap-4">
            <div className="grid grid-cols-1 gap-4">
              <Form.Field
                control={form.control}
                name="boardId"
                render={({ field }) => (
                  <Form.Item>
                    <Form.Label>Board</Form.Label>
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
            <div className="grid grid-cols-1 gap-4">
              <Form.Field
                name="userEmail"
                control={form.control}
                render={({ field }) => (
                  <Form.Item>
                    <Form.Label>User Email</Form.Label>
                    <Form.Control>
                      <Input {...field} placeholder="User Email" />
                    </Form.Control>
                    <Form.Message />
                  </Form.Item>
                )}
              />
              <Form.Field
                control={form.control}
                name="defaultCustomer"
                render={({ field }) => (
                  <Form.Item>
                    <Form.Label>Default Customer</Form.Label>
                    <Form.Control>
                      <Input {...field} placeholder="Default Customer" />
                    </Form.Control>
                    <Form.Message />
                  </Form.Item>
                )}
              />
              <Form.Field
                control={form.control}
                name="chooseResponseField"
                render={({ field }) => (
                  <Form.Item className="w-full">
                    <Form.Label>Choose Response Field</Form.Label>
                    <Select
                      value={field.value}
                      onValueChange={(value) => {
                        field.onChange(value);
                      }}
                    >
                      <Select.Trigger className="w-full">
                        <Select.Value placeholder="Choose Response Field" />
                      </Select.Trigger>
                      <Select.Content>
                        {CHOOSE_RESPONSE_FIELD_DATA.map((type) => (
                          <Select.Item key={type.value} value={type.value}>
                            {type.label}
                          </Select.Item>
                        ))}
                      </Select.Content>
                    </Select>
                    <Form.Message />
                  </Form.Item>
                )}
              />
            </div>
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

export const StageInErkhetMovementConfigForm = () => {
  const [showNewConfig, setShowNewConfig] = useState(false);
  const { createStageInErkhetMovementConfig, loading: createLoading } =
    useCreateStageInErkhetMovementConfig();
  const { data, refetch, loading } = useQuery(GET_CONFIGS_GET_VALUE, {
    variables: { code: 'stageInMoveConfig' },
    fetchPolicy: 'network-only',
  });

  const configValue = data?.configsGetValue?.value;

  const parseConfigValue = (value: any) => {
    if (!value) return null;
    return typeof value === 'string' ? JSON.parse(value) : value;
  };

  const parsedConfig = parseConfigValue(configValue);

  const handleSubmit = async (formData: TMovementErkhetConfig) => {
    try {
      const configsMapString = {
        stageInMoveConfig: {
          title: formData.title,
          boardId: formData.boardId,
          pipelineId: formData.pipelineId,
          stageId: formData.stageId,
          userEmail: formData.userEmail,
          chooseResponseField: formData.chooseResponseField,
          defaultCustomer: formData.defaultCustomer,
        },
      };

      await createStageInErkhetMovementConfig({
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
    <div className="h-full w-full mx-auto max-w-6xl flex flex-col">
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
