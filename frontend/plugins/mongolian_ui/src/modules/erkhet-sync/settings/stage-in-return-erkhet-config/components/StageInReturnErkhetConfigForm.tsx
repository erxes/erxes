import React, { useState } from 'react';
import { Accordion, Button, Form, Input, Select, useToast } from 'erxes-ui';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery, useMutation } from '@apollo/client';
import { TReturnErkhetConfig } from '../types';
import { addStageInReturnErkhetConfigSchema } from '../constants/addStageInReturnErkhetConfigSchema';
import { SelectSalesBoard } from './selects/SelectSalesBoard';
import { SelectPipeline } from './selects/SelectPipeline';
import { SelectStage } from './selects/SelectStage';
import { RETURN_TYPES } from '../constants/returnTypesData';
import { GET_CONFIGS_GET_VALUE } from '../graphql/queries/useStageInReturnErkhetConfigQuery';
import { CREATE_STAGE_IN_RETURN_ERKHET_CONFIG } from '../graphql/mutations/createStageInReturnErkhetConfigMutations';

const DEFAULT_VALUES: TReturnErkhetConfig = {
  title: '',
  boardId: '',
  pipelineId: '',
  stageId: '',
  userEmail: '',
  returnType: '',
};

const parseConfigs = (value: any): TReturnErkhetConfig[] => {
  if (!value) return [];
  const parsed = typeof value === 'string' ? JSON.parse(value) : value;
  return Array.isArray(parsed) ? parsed : [parsed];
};

interface ConfigItemFormProps {
  config: TReturnErkhetConfig;
  index: number;
  isNew: boolean;
  saving: boolean;
  onSave: (index: number, data: TReturnErkhetConfig) => void;
  onDelete: (index: number) => void;
  onCancelNew: () => void;
}

const ConfigItemForm: React.FC<ConfigItemFormProps> = ({
  config,
  index,
  isNew,
  saving,
  onSave,
  onDelete,
  onCancelNew,
}) => {
  const form = useForm<TReturnErkhetConfig>({
    resolver: zodResolver(addStageInReturnErkhetConfigSchema),
    defaultValues: config,
  });

  const selectedBoardId = form.watch('boardId');
  const selectedPipelineId = form.watch('pipelineId');
  const titleValue = form.watch('title');

  return (
    <Accordion.Item value={`config-${index}`}>
      <Accordion.Trigger className="text-base font-medium no-underline hover:no-underline">
        {titleValue || (
          <span className="text-muted-foreground italic">Untitled config</span>
        )}
      </Accordion.Trigger>
      <Accordion.Content>
        <Form {...form}>
          <form
            className="flex flex-col gap-6 pt-2 pb-4"
            onSubmit={form.handleSubmit((data) => onSave(index, data))}
          >
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

            <Form.Field
              control={form.control}
              name="boardId"
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
              name="returnType"
              render={({ field }) => (
                <Form.Item>
                  <Form.Label>Return Type</Form.Label>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <Select.Trigger className="w-full">
                      <Select.Value placeholder="Select a return type" />
                    </Select.Trigger>
                    <Select.Content>
                      {RETURN_TYPES.map((type) => (
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

            <div className="flex justify-end gap-2">
              {isNew && (
                <Button type="button" variant="outline" onClick={onCancelNew}>
                  Cancel
                </Button>
              )}
              {!isNew && (
                <Button
                  type="button"
                  variant="destructive"
                  onClick={() => onDelete(index)}
                  disabled={saving}
                >
                  Delete
                </Button>
              )}
              <Button type="submit" disabled={saving}>
                {saving ? 'Saving...' : 'Save'}
              </Button>
            </div>
          </form>
        </Form>
      </Accordion.Content>
    </Accordion.Item>
  );
};

export const StageInReturnErkhetConfigForm = () => {
  const { toast } = useToast();
  const [newConfig, setNewConfig] = useState<TReturnErkhetConfig | null>(null);

  const { data, refetch, loading } = useQuery(GET_CONFIGS_GET_VALUE, {
    variables: { code: 'returnEbarimtConfig' },
    fetchPolicy: 'network-only',
  });

  const [saveConfig, { loading: saving }] = useMutation(
    CREATE_STAGE_IN_RETURN_ERKHET_CONFIG,
    {
      onCompleted: () => {
        toast({
          title: 'Success',
          description: 'Return erkhet config saved successfully',
          variant: 'default',
        });
        refetch();
      },
      onError: (e) => {
        toast({
          title: 'Error',
          description: e.message,
          variant: 'destructive',
        });
      },
    },
  );

  const configs = parseConfigs(
    data?.configsGetValue?.value ?? data?.configsGetValue,
  );

  const persistConfigs = (updated: TReturnErkhetConfig[]) =>
    saveConfig({ variables: { configsMap: { returnEbarimtConfig: updated } } });

  const handleSave = async (index: number, formData: TReturnErkhetConfig) => {
    if (newConfig && index === configs.length) {
      await persistConfigs([...configs, formData]);
      setNewConfig(null);
    } else {
      const updated = configs.map((c, i) => (i === index ? formData : c));
      await persistConfigs(updated);
    }
  };

  const handleDelete = async (index: number) => {
    const updated = configs.filter((_, i) => i !== index);
    await persistConfigs(updated);
  };

  const allItems = newConfig ? [...configs, newConfig] : configs;
  const defaultOpen = allItems.map((_, i) => `config-${i}`);

  return (
    <div className="h-full w-full mx-auto max-w-6xl px-9 py-5 overflow-y-auto">
      <Accordion type="multiple" defaultValue={defaultOpen} className="w-full">
        <div className="flex items-center justify-between py-3 border-b">
          <span className="text-xl font-semibold">Return Erkhet configs</span>
          <Button
            type="button"
            size="sm"
            onClick={() => setNewConfig({ ...DEFAULT_VALUES })}
            disabled={!!newConfig}
          >
            New Config
          </Button>
        </div>

        {loading ? (
          <div className="py-4 text-sm text-muted-foreground">Loading...</div>
        ) : (
          allItems.map((config, index) => (
            <ConfigItemForm
              key={
                newConfig && index === configs.length
                  ? 'new'
                  : `${config.title}-${index}`
              }
              config={config}
              index={index}
              isNew={!!(newConfig && index === configs.length)}
              saving={saving}
              onSave={handleSave}
              onDelete={handleDelete}
              onCancelNew={() => setNewConfig(null)}
            />
          ))
        )}
      </Accordion>
    </div>
  );
};
