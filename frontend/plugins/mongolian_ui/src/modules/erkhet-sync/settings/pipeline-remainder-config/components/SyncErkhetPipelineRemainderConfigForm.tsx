import React, { useState } from 'react';
import { Accordion, Button, Form, Input, useToast } from 'erxes-ui';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery, useMutation } from '@apollo/client';
import { TAddPipelineRemainderConfig } from '../types';
import { addPipelineRemainderConfigSchema } from '../constants/addPipelineRemainderConfigSchema';
import { SelectSalesBoard } from './selects/SelectBoard';
import { SelectPipeline } from './selects/SelectPipeline';
import { SelectStage } from './selects/SelectStage';
import { GET_CONFIGS_GET_VALUE } from '../graphql/queries/usePipelineRemainderConfigQuery';
import { CREATE_PIPELINE_REMAINDER_CONFIG } from '../graphql/mutations/createPipelineRemainderConfigMutations';

const DEFAULT_VALUES: TAddPipelineRemainderConfig = {
  title: '',
  boardId: '',
  pipelineId: '',
  stageId: '',
  account: '',
  location: '',
};

function parseConfigs(value: unknown): TAddPipelineRemainderConfig[] {
  if (!value) return [];

  try {
    const parsed = typeof value === 'string' ? JSON.parse(value) : value;
    return Array.isArray(parsed) ? parsed : [parsed];
  } catch {
    return [];
  }
}
interface ConfigItemFormProps {
  config: TAddPipelineRemainderConfig;
  index: number;
  isNew: boolean;
  saving: boolean;
  onSave: (index: number, data: TAddPipelineRemainderConfig) => void;
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
  const form = useForm<TAddPipelineRemainderConfig>({
    resolver: zodResolver(addPipelineRemainderConfigSchema),
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
              name="account"
              control={form.control}
              render={({ field }) => (
                <Form.Item>
                  <Form.Label>Account</Form.Label>
                  <Form.Control>
                    <Input {...field} placeholder="Account" />
                  </Form.Control>
                  <Form.Message />
                </Form.Item>
              )}
            />

            <Form.Field
              name="location"
              control={form.control}
              render={({ field }) => (
                <Form.Item>
                  <Form.Label>Location</Form.Label>
                  <Form.Control>
                    <Input {...field} placeholder="Location" />
                  </Form.Control>
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

export const SyncErkhetPipelineRemainderConfigForm = () => {
  const { toast } = useToast();
  const [newConfig, setNewConfig] =
    useState<TAddPipelineRemainderConfig | null>(null);

  const { data, refetch, loading, error } = useQuery(GET_CONFIGS_GET_VALUE, {
    variables: { code: 'remainderConfig' },
    fetchPolicy: 'network-only',
  });

  const [saveConfig, { loading: saving }] = useMutation(
    CREATE_PIPELINE_REMAINDER_CONFIG,
    {
      onCompleted: () => {
        toast({
          title: 'Success',
          description: 'Pipeline remainder config saved successfully',
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

  const persistConfigs = (updated: TAddPipelineRemainderConfig[]) =>
    saveConfig({
      variables: { configsMap: { remainderConfig: JSON.stringify(updated) } },
    });

  const handleSave = async (
    index: number,
    formData: TAddPipelineRemainderConfig,
  ) => {
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
          <span className="text-xl font-semibold">
            Pipeline remainder configs
          </span>
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
        ) : error ? (
          <div className="py-4 text-sm text-destructive">
            Error loading configs: {error.message}
          </div>
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
