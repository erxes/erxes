import { useTranslation } from 'react-i18next';
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
import { useCreateStageInErkhetConfig } from '../../hooks/useCreateStageInErkhetConfig';
import { GET_CONFIGS_GET_VALUE } from '../../graphql/queries/useStageInErkhetConfigQuery';
import { DEFAULT_PAY_DATA } from '../../constants/defaultPayData';

const defaultValues = {
  title: '',
  boardId: '',
  pipelineId: '',
  stageId: '',
  userEmail: '',
  responseField: '',
  hasVat: false,
  hasCitytax: false,
  reverseCtaxRules: [],
  reverseVatRules: [],
  defaultPay: 'debtAmount',
  нэхэмжлэх: '',
  хаанБанкданс: '',
  голомтБанкданс: '',
  barter: '',
};

const normalizeRuleIds = (value?: string | string[]) => {
  if (!value) {
    return [];
  }

  return Array.isArray(value) ? value.filter(Boolean) : [value].filter(Boolean);
};

const EditConfigForm = ({ config, onNewConfig, onSubmit, loading }: any) => {
  const { t } = useTranslation('mongolian');
  const form = useForm<TErkhetConfig>({
    resolver: zodResolver(addStageInErkhetConfigSchema),
    defaultValues: {
      title: config?.title || '',
      boardId: config?.boardId || '',
      pipelineId: config?.pipelineId || '',
      stageId: config?.stageId || '',
      userEmail: config?.userEmail || '',
      responseField: config?.responseField || '',
      hasVat: config?.hasVat || false,
      hasCitytax: config?.hasCitytax || false,
      reverseCtaxRules: normalizeRuleIds(config?.reverseCtaxRules),
      reverseVatRules: normalizeRuleIds(config?.reverseVatRules),
      defaultPay: config?.defaultPay || '',
      нэхэмжлэх: config?.нэхэмжлэх || '',
      хаанБанкданс: config?.хаанБанкданс || '',
      голомтБанкданс: config?.голомтБанкданс || '',
      barter: config?.barter || '',
    },
  });

  const selectedBoardId = form.watch('boardId');
  const selectedPipelineId = form.watch('pipelineId');
  const hasVat = form.watch('hasVat');
  const hasCitytax = form.watch('hasCitytax');

  return (
    <div className="">
      <Form {...form}>
        <form
          className="h-full w-full mx-auto max-w-6xl px-9 py-5 flex flex-col gap-4"
          onSubmit={form.handleSubmit(onSubmit)}
        >
          <div className="flex justify-between items-center">
            <h1 className="text-lg font-semibold">
              Борлуулалт урьдчилсан байдлаар
            </h1>
            <Button type="button" onClick={onNewConfig}>
              {t('new-config')}
            </Button>
          </div>

          <Form.Field
            name="title"
            control={form.control}
            render={({ field }) => (
              <Form.Item>
                <Form.Label>{t('title')}</Form.Label>
                <Form.Control>
                  <Input {...field} placeholder={t('title')} />
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
                  name="responseField"
                  render={({ field }) => (
                    <Form.Item className="w-full">
                      <Form.Label>{t('choose-response-field')}</Form.Label>
                      <Select
                        value={field.value}
                        onValueChange={(value) => {
                          field.onChange(value);
                        }}
                      >
                        <Select.Trigger className="w-full">
                          <Select.Value placeholder={t('choose-response-field')} />
                        </Select.Trigger>
                        <Select.Content>
                          {CHOOSE_RESPONSE_FIELD_DATA.map(
                            (type: { value: string; label: string }) => (
                              <Select.Item key={type.value} value={type.value}>
                                {type.label}
                              </Select.Item>
                            ),
                          )}
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
                      <Form.Label>{t('user-email')}</Form.Label>
                      <Form.Control>
                        <Input {...field} placeholder={t('user-email')} />
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
                      <Form.Label variant="peer">{t('has-vat')}</Form.Label>
                      <Form.Control>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </Form.Control>
                    </Form.Item>
                  )}
                />
                {hasVat && (
                  <Form.Field
                    control={form.control}
                    name="reverseVatRules"
                    render={({ field }) => (
                      <Form.Item>
                        <Form.Label>
                          {t('another-rules-of-products-on-vat')}
                        </Form.Label>
                        <SelectAnotherRulesOfProductsOnCityTax
                          value={field.value}
                          onValueChange={field.onChange}
                          kind="vat"
                        />
                        <Form.Message />
                      </Form.Item>
                    )}
                  />
                )}
                <Form.Field
                  control={form.control}
                  name="hasCitytax"
                  render={({ field }) => (
                    <Form.Item className="col-span-2 flex items-center gap-2 space-y-0">
                      <Form.Label variant="peer">{t('has-citytax')}</Form.Label>
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
                {!hasCitytax && (
                  <Form.Field
                    control={form.control}
                    name="reverseCtaxRules"
                    render={({ field }) => (
                      <Form.Item>
                        <Form.Label>
                          {t('another-rules-of-products-on-citytax')}
                        </Form.Label>
                        <SelectAnotherRulesOfProductsOnCityTax
                          value={field.value}
                          onValueChange={field.onChange}
                          kind="ctax"
                        />
                        <Form.Message />
                      </Form.Item>
                    )}
                  />
                )}
              </div>
            </div>
          </div>

          <Form.Field
            control={form.control}
            name="defaultPay"
            render={({ field }) => (
              <Form.Item className="w-full">
                <Form.Label>{t('default-pay')}</Form.Label>
                <Select value={field.value} onValueChange={field.onChange}>
                  <Select.Trigger className="w-full">
                    <Select.Value placeholder={t('default-pay')} />
                  </Select.Trigger>
                  <Select.Content>
                    {DEFAULT_PAY_DATA.map((type) => (
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

          <div className="flex justify-end">
            <Button type="submit" disabled={loading}>
              {loading ? t('saving') : t('save')}
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
  const { t } = useTranslation('mongolian');
  const form = useForm<TErkhetConfig>({
    resolver: zodResolver(addStageInErkhetConfigSchema),
    defaultValues,
  });

  const selectedBoardId = form.watch('boardId');
  const selectedPipelineId = form.watch('pipelineId');
  const hasVat = form.watch('hasVat');
  const hasCitytax = form.watch('hasCitytax');

  return (
    <div className="">
      <Form {...form}>
        <form
          className="w-full mx-auto max-w-6xl flex flex-col gap-4 px-9 py-5"
          onSubmit={form.handleSubmit(onSubmit)}
        >
          <h1 className="text-lg font-semibold">
            Борлуулалт урьдчилсан байдлаар
          </h1>

          <Form.Field
            name="title"
            control={form.control}
            render={({ field }) => (
              <Form.Item>
                <Form.Label>{t('title')}</Form.Label>
                <Form.Control>
                  <Input {...field} placeholder={t('title')} />
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
                  name="responseField"
                  render={({ field }) => (
                    <Form.Item className="w-full">
                      <Form.Label>{t('choose-response-field')}</Form.Label>
                      <Select
                        value={field.value}
                        onValueChange={(value) => {
                          field.onChange(value);
                        }}
                      >
                        <Select.Trigger className="w-full">
                          <Select.Value placeholder={t('choose-response-field')} />
                        </Select.Trigger>
                        <Select.Content>
                          {CHOOSE_RESPONSE_FIELD_DATA.map(
                            (type: { value: string; label: string }) => (
                              <Select.Item key={type.value} value={type.value}>
                                {type.label}
                              </Select.Item>
                            ),
                          )}
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
                      <Form.Label>{t('user-email')}</Form.Label>
                      <Form.Control>
                        <Input {...field} placeholder={t('user-email')} />
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
                      <Form.Label variant="peer">{t('has-vat')}</Form.Label>
                      <Form.Control>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </Form.Control>
                    </Form.Item>
                  )}
                />
                {hasVat && (
                  <Form.Field
                    control={form.control}
                    name="reverseVatRules"
                    render={({ field }) => (
                      <Form.Item>
                        <Form.Label>
                          {t('another-rules-of-products-on-vat')}
                        </Form.Label>
                        <SelectAnotherRulesOfProductsOnCityTax
                          value={field.value}
                          onValueChange={field.onChange}
                          kind="vat"
                        />
                        <Form.Message />
                      </Form.Item>
                    )}
                  />
                )}
                <Form.Field
                  control={form.control}
                  name="hasCitytax"
                  render={({ field }) => (
                    <Form.Item className="col-span-2 flex items-center gap-2 space-y-0">
                      <Form.Label variant="peer">{t('has-citytax')}</Form.Label>
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
                {!hasCitytax && (
                  <Form.Field
                    control={form.control}
                    name="reverseCtaxRules"
                    render={({ field }) => (
                      <Form.Item>
                        <Form.Label>
                          {t('another-rules-of-products-on-citytax')}
                        </Form.Label>
                        <SelectAnotherRulesOfProductsOnCityTax
                          value={field.value}
                          onValueChange={field.onChange}
                          kind="ctax"
                        />
                        <Form.Message />
                      </Form.Item>
                    )}
                  />
                )}
              </div>
            </div>
          </div>

          <Form.Field
            control={form.control}
            name="defaultPay"
            render={({ field }) => (
              <Form.Item className="w-full">
                <Form.Label>{t('default-pay')}</Form.Label>
                <Select value={field.value} onValueChange={field.onChange}>
                  <Select.Trigger className="w-full">
                    <Select.Value placeholder={t('default-pay')} />
                  </Select.Trigger>
                  <Select.Content>
                    {DEFAULT_PAY_DATA.map((type) => (
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

          <div className="flex justify-end gap-2 mt-6">
            <Button type="button" variant="outline" onClick={onCancel}>
              {t('cancel')}
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? t('saving') : t('save')}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export const SalesAreTentativeForm = () => {
  const { t } = useTranslation('mongolian');
  const [showNewConfig, setShowNewConfig] = useState(false);
  const { createStageInErkhetConfig, loading: createLoading } =
    useCreateStageInErkhetConfig();
  const { data, refetch, loading } = useQuery(GET_CONFIGS_GET_VALUE, {
    variables: { code: 'ebarimtConfig' },
    fetchPolicy: 'network-only',
  });

  const configValue = data?.mnConfigs?.[0]?.value;

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
          responseField: formData.responseField,
          userEmail: formData.userEmail,
          hasVat: formData.hasVat,
          hasCitytax: formData.hasCitytax,
          reverseCtaxRules: formData.hasCitytax
            ? []
            : normalizeRuleIds(formData.reverseCtaxRules),
          reverseVatRules: formData.hasVat
            ? normalizeRuleIds(formData.reverseVatRules)
            : [],
          defaultPay: formData.defaultPay,
          нэхэмжлэх: formData.нэхэмжлэх,
          хаанБанкданс: formData.хаанБанкданс,
          голомтБанкданс: formData.голомтБанкданс,
          barter: formData.barter,
        },
      };

      await createStageInErkhetConfig({
        variables: {
          code: 'ebarimtConfig',
          subId: formData.stageId,
          value: configsMapString.ebarimtConfig,
        },
      });

      await refetch();

      setShowNewConfig(false);
    } catch (error) {
      console.error('Error saving config:', error);
    }
  };

  if (loading) {
    return <div>{t('loading')}</div>;
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
