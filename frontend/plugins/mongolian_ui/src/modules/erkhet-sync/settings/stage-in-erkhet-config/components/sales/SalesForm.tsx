import { Button, Checkbox, Form, Input, Select } from 'erxes-ui';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery } from '@apollo/client';
import { TErkhetConfig } from '../../types';
import { addStageInErkhetConfigSchema } from '../../constants/addStageInErkhetConfigSchema';
import { PipelineFields } from '../PipelineFields';
import { CHOOSE_RESPONSE_FIELD_DATA } from '../../constants/chooseResponseFieldData';
import { SelectAnotherRulesOfProductsOnCityTax } from '../selects/SelectAnotherRulesOfProductsOnCityTax';
import { PaymentFields } from '../PaymentFields';
import { useCreateStageInErkhetConfig } from '../../hooks/useCreateStageInErkhetConfig';
import { GET_CONFIGS_GET_VALUE } from '../../graphql/queries/useStageInErkhetConfigQuery';

const defaultValues = {
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

const EditConfigForm = ({ config, onNewConfig, onSubmit, loading }: any) => {
  const form = useForm<TErkhetConfig>({
    resolver: zodResolver(addStageInErkhetConfigSchema),
    defaultValues: {
      title: config?.title || '',
      boardId: config?.boardId || '',
      pipelineId: config?.pipelineId || '',
      stageId: config?.stageId || '',
      userEmail: config?.userEmail || '',
      chooseResponseField: config?.chooseResponseField || '',
      hasVat: config?.hasVat || false,
      hasCityTax: config?.hasCityTax || false,
      anotherRulesOfProductsOnCitytax:
        config?.anotherRulesOfProductsOnCitytax || '',
      anotherRulesOfProductsOnVat: config?.anotherRulesOfProductsOnVat || '',
      defaultPay: config?.defaultPay || '',
      нэхэмжлэх: config?.нэхэмжлэх || '',
      хаанБанкданс: config?.хаанБанкданс || '',
      голомтБанкданс: config?.голомтБанкданс || '',
      barter: config?.barter || '',
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
            <h1 className="text-lg font-semibold">Борлуулалт</h1>
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

          <div className="flex flex-col gap-4">
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
                    <Form.Item className="col-span-2 flex items-center gap-2 space-y-0">
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
                    <Form.Item className="col-span-2 flex items-center gap-2 space-y-0">
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
  onSubmit: (data: TErkhetConfig) => void;
  loading: boolean;
}) => {
  const form = useForm<TErkhetConfig>({
    resolver: zodResolver(addStageInErkhetConfigSchema),
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
          <h1 className="text-lg font-semibold">Борлуулалт</h1>

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
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-4">
                <PipelineFields
                  control={form.control}
                  selectedBoardId={selectedBoardId}
                  selectedPipelineId={selectedPipelineId}
                  onBoardChange={(value: string) => {
                    form.setValue('pipelineId', '');
                    form.setValue('stageId', '');
                  }}
                  onPipelineChange={(value: string) => {
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
                    <Form.Item className="col-span-2 flex items-center gap-2 space-y-0">
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
                    <Form.Item className="col-span-2 flex items-center gap-2 space-y-0">
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

export const SalesForm = () => {
  const [showNewConfig, setShowNewConfig] = useState(false);
  const { createStageInErkhetConfig, loading: createLoading } =
    useCreateStageInErkhetConfig();
  const { data, refetch, loading } = useQuery(GET_CONFIGS_GET_VALUE, {
    variables: { code: 'ebarimtConfig' },
    fetchPolicy: 'network-only',
  });

  const configValue = data?.configsGetValue?.value;

  const parseConfigValue = (value: any) => {
    if (!value) return null;
    return typeof value === 'string' ? JSON.parse(value) : value;
  };

  const parsedConfig = parseConfigValue(configValue);

  const handleSubmit = async (formData: TErkhetConfig) => {
    try {
      const configsMapString = {
        ebarimtConfig: {
          title: formData.title,
          boardId: formData.boardId,
          pipelineId: formData.pipelineId,
          stageId: formData.stageId,
          chooseResponseField: formData.chooseResponseField,
          userEmail: formData.userEmail,
          hasVat: formData.hasVat,
          hasCityTax: formData.hasCityTax,
          anotherRulesOfProductsOnCitytax:
            formData.anotherRulesOfProductsOnCitytax,
          anotherRulesOfProductsOnVat: formData.anotherRulesOfProductsOnVat,
          defaultPay: formData.defaultPay,
          нэхэмжлэх: formData.нэхэмжлэх,
          хаанБанкданс: formData.хаанБанкданс,
          голомтБанкданс: formData.голомтБанкданс,
          barter: formData.barter,
        },
      };

      await createStageInErkhetConfig({
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
