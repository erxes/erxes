import { useQuery } from '@apollo/client';
import { Form, isEnabled } from 'erxes-ui';
import { useEffect } from 'react';
import { UseFormReturn, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { SelectBoard, SelectPipeline, SelectStage } from 'ui-modules';
import { z } from 'zod';
import { TR_STATUSES } from '@/transactions/types/constants';
import { PIPELINE_DETAIL } from '../graphql/queries/relatedQueries';
import {
  SyncConfigGeneralFields,
  SyncConfigAccountsSection,
  SyncConfigPaymentsSection,
  SyncConfigVatCtaxSection,
  SyncConfigFormFooter,
} from './SyncConfigFormSections';
import { SyncResponseFieldSelect } from './SyncResponseFieldSelect';
import { SyncSettingSection } from './SyncSettingSection';

export const syncDealConfigFormSchema = z.object({
  title: z.string(),
  boardId: z.string().optional(),
  pipelineId: z.string().optional(),
  stageId: z.string(),
  responseFieldId: z.string().optional(),
  dateRule: z.enum(['alwaysNow', 'syncedDateOrNow']),
  trStatus: z.string().optional(),
  saleAccountId: z.string(),
  saleOutAccountId: z.string(),
  saleCostAccountId: z.string(),
  branchId: z.string(),
  departmentId: z.string(),
  hasVat: z.boolean(),
  vatRowId: z.string(),
  reverseVatRules: z.array(z.string()).optional(),
  hasCtax: z.boolean(),
  ctaxRowId: z.string(),
  reverseCtaxRules: z.array(z.string()).optional(),
  payments: z.record(
    z.object({
      accountId: z.string(),
    }),
  ),
  defaultPayment: z.object({
    accountId: z.string(),
  }),
  defaultNegPayment: z.object({
    accountId: z.string(),
  }),
});

type ConfigFormValues = z.infer<typeof syncDealConfigFormSchema>;

const normalizeRuleIds = (value?: string | string[]) => {
  if (!value) return [];
  return Array.isArray(value) ? value.filter(Boolean) : [value].filter(Boolean);
};

export const SyncDealConfigForm = ({
  form,
  onSubmit,
  loading,
}: {
  form: UseFormReturn<ConfigFormValues>;
  onSubmit: (data: any) => void;
  loading: boolean;
}) => {
  const { t } = useTranslation('accounting');
  const boardId = useWatch({ control: form.control, name: 'boardId' });
  const pipelineId = useWatch({ control: form.control, name: 'pipelineId' });

  const { data: pipelineDetail, refetch: pipelineRefetch } = useQuery(
    PIPELINE_DETAIL,
    {
      variables: { _id: pipelineId },
      skip: !pipelineId, // pipelineId байхгүй үед асуухгүй
      fetchPolicy: 'network-only', // заавал backend-ээс авна
    },
  );

  useEffect(() => {
    form.setValue('pipelineId', '');
  }, [boardId, form]);

  useEffect(() => {
    form.setValue('stageId', '');
  }, [pipelineId, form]);

  useEffect(() => {
    if (pipelineId) {
      pipelineRefetch({ _id: pipelineId });
    }
  }, [pipelineId, pipelineRefetch]);

  useEffect(() => {
    if (!form.getValues('trStatus')) {
      form.setValue('trStatus', TR_STATUSES.COMPLETE);
    }
  }, [form]);

  // note: const paymentIds: string[] = pipelineDetail?.salesPipelineDetail?.paymentIds || [];
  const paymentTypes: any[] =
    pipelineDetail?.salesPipelineDetail?.paymentTypes || [];
  const mongolianEnabled = isEnabled('mongolian');

  const handleSubmit = (data: ConfigFormValues) =>
    onSubmit({
      ...data,
      vatRowId: data.hasVat ? data.vatRowId : '',
      reverseVatRules:
        mongolianEnabled && !data.hasVat
          ? normalizeRuleIds(data.reverseVatRules)
          : [],
      ctaxRowId: data.hasCtax ? data.ctaxRowId : '',
      reverseCtaxRules:
        !mongolianEnabled || data.hasCtax
          ? []
          : normalizeRuleIds(data.reverseCtaxRules),
    });

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className="flex flex-col flex-1 min-h-0 bg-background"
      >
        <div className="flex-1 min-h-0 overflow-y-auto p-5 space-y-5">
          <SyncSettingSection title={t('general')}>
            <SyncConfigGeneralFields />
          </SyncSettingSection>

          <SyncSettingSection title={t('pipeline')}>
            <Form.Field
              control={form.control}
              name="boardId"
              render={({ field }) => (
                <Form.Item>
                  <Form.Label>{t('board')}</Form.Label>
                  <SelectBoard.FormItem
                    mode="single"
                    value={field.value}
                    onValueChange={field.onChange}
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
                  <Form.Label>{t('pipeline')}</Form.Label>
                  <SelectPipeline.FormItem
                    mode="single"
                    value={field.value}
                    boardId={boardId || undefined}
                    onValueChange={field.onChange}
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
                  <Form.Label>{t('stage')}</Form.Label>
                  <SelectStage.FormItem
                    mode="single"
                    value={field.value}
                    pipelineId={pipelineId || undefined}
                    onValueChange={field.onChange}
                  />
                  <Form.Message />
                </Form.Item>
              )}
            />
            <SyncResponseFieldSelect form={form} />
          </SyncSettingSection>

          <SyncConfigAccountsSection />
          <SyncConfigPaymentsSection
            paymentTypes={paymentTypes}
            paymentKey={pipelineId || ''}
          />
          <SyncConfigVatCtaxSection />
        </div>
        <SyncConfigFormFooter loading={loading} />
      </form>
    </Form>
  );
};

export { SyncSettingSection } from './SyncSettingSection';
