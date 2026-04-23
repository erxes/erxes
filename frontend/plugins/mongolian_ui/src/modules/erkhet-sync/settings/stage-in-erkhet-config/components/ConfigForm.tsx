import React, { useState } from 'react';
import {
  Accordion,
  Button,
  Checkbox,
  Form,
  Input,
  Select,
  useToast,
} from 'erxes-ui';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery, useMutation } from '@apollo/client';
import { TErkhetConfig } from '../types';
import { addStageInErkhetConfigSchema } from '../constants/addStageInErkhetConfigSchema';
import { PipelineFields } from './PipelineFields';
import { CHOOSE_RESPONSE_FIELD_DATA } from '../constants/chooseResponseFieldData';
import { SelectAnotherRulesOfProductsOnCityTax } from './selects/SelectAnotherRulesOfProductsOnCityTax';
import { PaymentFields } from './PaymentFields';
import { GET_CONFIGS_GET_VALUE } from '../graphql/queries/useStageInErkhetConfigQuery';
import { CREATE_STAGE_IN_ERKHET_CONFIG } from '../graphql/mutations/createStageInErkhetConfigMutations';

const DEFAULT_VALUES: TErkhetConfig = {
  title: '',
  boardId: '',
  pipelineId: '',
  stageId: '',
  userEmail: '',
  chooseResponseField: '',
  hasVat: false,
  hasCityTax: false,
  anotherRulesOfProductsOnCitytax: '',
  anotherRulesOfProductsOnVat: '',
  defaultPay: '',
  нэхэмжлэх: '',
  хаанБанкданс: '',
  голомтБанкданс: '',
  barter: '',
};

const parseConfigs = (value: any): TErkhetConfig[] => {
  if (!value) return [];
  const parsed = typeof value === 'string' ? JSON.parse(value) : value;
  return Array.isArray(parsed) ? parsed : [parsed];
};

interface ConfigItemFormProps {
  config: TErkhetConfig;
  index: number;
  isNew: boolean;
  saving: boolean;
  onSave: (index: number, data: TErkhetConfig) => void;
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
  const form = useForm<TErkhetConfig>({
    resolver: zodResolver(addStageInErkhetConfigSchema),
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

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-4">
                <PipelineFields
                  control={form.control}
                  selectedBoardId={selectedBoardId}
                  selectedPipelineId={selectedPipelineId}
                  onBoardChange={() => {
                    form.setValue('pipelineId', '');
                    form.setValue('stageId', '');
                  }}
                  onPipelineChange={() => {
                    form.setValue('stageId', '');
                  }}
                />

                <Form.Field
                  control={form.control}
                  name="chooseResponseField"
                  render={({ field }) => (
                    <Form.Item className="w-full">
                      <Form.Label>Choose Response Field</Form.Label>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
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

              <div className="flex flex-col gap-4">
                <Form.Field
                  control={form.control}
                  name="userEmail"
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
                  name="hasVat"
                  render={({ field }) => (
                    <Form.Item className="flex items-center gap-2 space-y-0">
                      <Form.Label variant="peer">Has Vat</Form.Label>
                      <Form.Control>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </Form.Control>
                    </Form.Item>
                  )}
                />

                <Form.Field
                  control={form.control}
                  name="anotherRulesOfProductsOnVat"
                  render={({ field }) => (
                    <Form.Item>
                      <Form.Label>Another rules of products on vat</Form.Label>
                      <Form.Control>
                        <Input
                          {...field}
                          placeholder="Another rules of products on vat"
                        />
                      </Form.Control>
                      <Form.Message />
                    </Form.Item>
                  )}
                />

                <Form.Field
                  control={form.control}
                  name="hasCityTax"
                  render={({ field }) => (
                    <Form.Item className="flex items-center gap-2 space-y-0">
                      <Form.Label variant="peer">Has City Tax</Form.Label>
                      <Form.Control>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </Form.Control>
                      <Form.Message />
                    </Form.Item>
                  )}
                />

                <Form.Field
                  control={form.control}
                  name="anotherRulesOfProductsOnCitytax"
                  render={({ field }) => (
                    <Form.Item>
                      <Form.Label>
                        Another rules of products on city tax
                      </Form.Label>
                      <SelectAnotherRulesOfProductsOnCityTax
                        value={field.value}
                        onValueChange={field.onChange}
                      />
                      <Form.Message />
                    </Form.Item>
                  )}
                />
              </div>
            </div>

            <PaymentFields control={form.control} />

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

interface ConfigFormProps {
  title?: string;
  configCode: string;
}

export const ConfigForm: React.FC<ConfigFormProps> = ({
  title,
  configCode,
}) => {
  const { toast } = useToast();
  const [newConfig, setNewConfig] = useState<TErkhetConfig | null>(null);

  const { data, refetch, loading } = useQuery(GET_CONFIGS_GET_VALUE, {
    variables: { code: configCode },
    fetchPolicy: 'network-only',
  });

  const [saveConfig, { loading: saving }] = useMutation(
    CREATE_STAGE_IN_ERKHET_CONFIG,
    {
      onCompleted: () => {
        toast({
          title: 'Success',
          description: 'Config saved successfully',
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

  const persistConfigs = (updated: TErkhetConfig[]) =>
    saveConfig({ variables: { configsMap: { [configCode]: updated } } });

  const handleSave = async (index: number, formData: TErkhetConfig) => {
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

  const handleAddNew = () => {
    setNewConfig({ ...DEFAULT_VALUES });
  };

  const allItems = newConfig ? [...configs, newConfig] : configs;

  const defaultOpen = allItems.map((_, i) => `config-${i}`);

  return (
    <Accordion type="multiple" defaultValue={defaultOpen} className="w-full">
      <div className="flex items-center justify-between py-3 border-b">
        <span className="text-xl font-semibold">
          {title ?? 'Erkhet configs'}
        </span>
        <Button
          type="button"
          size="sm"
          onClick={handleAddNew}
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
  );
};
