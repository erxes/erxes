import { useQuery } from '@apollo/client';
import { Form, isEnabled, Select } from 'erxes-ui';
import { useEffect, useMemo } from 'react';
import { UseFormReturn, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import { TR_STATUSES } from '@/transactions/types/constants';
import { POS_DETAIL, POS_LIST } from '../graphql/queries/relatedQueries';
import {
  SyncConfigGeneralFields,
  SyncConfigAccountsSection,
  SyncConfigPaymentsSection,
  SyncConfigVatCtaxSection,
  SyncConfigFormFooter,
  SyncConfigReturnTypeField,
  TPaymentType,
} from './SyncConfigFormSections';
import { SyncSettingSection } from './SyncSettingSection';

export const syncOrderConfigFormSchema = z.object({
  title: z.string(),
  posId: z.string(),
  dateRule: z.enum(['alwaysNow', 'syncedDateOrNow']),
  trStatus: z.string().optional(),
  returnType: z.enum(['fullTr', 'onlySale', 'delete']),
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

type ConfigFormValues = z.infer<typeof syncOrderConfigFormSchema>;

const normalizeRuleIds = (value?: string | string[]) => {
  if (!value) return [];
  return Array.isArray(value) ? value.filter(Boolean) : [value].filter(Boolean);
};

export const SyncOrderConfigForm = ({
  form,
  onSubmit,
  loading,
}: {
  form: UseFormReturn<ConfigFormValues>;
  onSubmit: (data: ConfigFormValues) => void;
  loading: boolean;
}) => {
  const { t } = useTranslation('accounting');
  const posId = useWatch({ control: form.control, name: 'posId' });

  const { data: posList, loading: posListLoading } = useQuery(POS_LIST, {});
  const posOptions: { value: string; label: string }[] = useMemo(() => {
    if (posListLoading) return [];
    return posList?.posList?.map((p: { name: string; _id: string }) => ({
      label: p.name,
      value: p._id,
    }));
  }, [posList, posListLoading]);

  const { data: posDetailData, refetch: posRefetch } = useQuery(POS_DETAIL, {
    variables: { _id: posId },
    skip: !posId, // posId байхгүй үед асуухгүй
    fetchPolicy: 'network-only', // заавал backend-ээс авна
  });

  useEffect(() => {
    if (posId) posRefetch({ _id: posId });
  }, [posId, posRefetch]);

  useEffect(() => {
    if (!form.getValues('trStatus'))
      form.setValue('trStatus', TR_STATUSES.COMPLETE);
  }, [form]);

  useEffect(() => {
    if (!form.getValues('returnType')) form.setValue('returnType', 'fullTr');
  }, [form]);

  // note: const paymentIds: string[] = pipelineDetail?.salesPipelineDetail?.paymentIds || [];
  const paymentTypes: TPaymentType[] = posDetailData?.posDetail?.paymentTypes || [];
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
            <SyncConfigReturnTypeField />
          </SyncSettingSection>

          <SyncSettingSection title="POS">
            <Form.Field
              control={form.control}
              name="posId"
              render={({ field }) => (
                <Form.Item>
                  <Form.Label>POS</Form.Label>
                  <Form.Control>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <Select.Trigger>
                        <Select.Value placeholder={t('select-pos')} />
                      </Select.Trigger>
                      <Select.Content>
                        {posOptions.map((opt) => (
                          <Select.Item key={opt.value} value={opt.value}>
                            {opt.label}
                          </Select.Item>
                        ))}
                      </Select.Content>
                    </Select>
                  </Form.Control>
                </Form.Item>
              )}
            />
          </SyncSettingSection>

          <SyncConfigAccountsSection />
          <SyncConfigPaymentsSection
            paymentTypes={paymentTypes}
            paymentKey={posId || ''}
          />
          <SyncConfigVatCtaxSection />
        </div>
        <SyncConfigFormFooter loading={loading} />
      </form>
    </Form>
  );
};

export { SyncSettingSection } from './SyncSettingSection';
