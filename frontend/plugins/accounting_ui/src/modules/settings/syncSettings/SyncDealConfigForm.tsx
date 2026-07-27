import { Form, isEnabled } from 'erxes-ui';
import {
  SyncConfigAccountsSection,
  SyncConfigFormFooter,
  SyncConfigGeneralFields,
  SyncConfigPaymentsSection,
  SyncConfigPipelineSection,
  SyncConfigVatCtaxSection,
  TPaymentType,
  normalizeSyncConfigData,
  usePipelineReset,
} from './SyncConfigFormSections';

import { PIPELINE_DETAIL } from '../graphql/queries/relatedQueries';
import { SyncSettingSection } from './SyncSettingSection';
import { TR_STATUSES } from '@/transactions/types/constants';
import { UseFormReturn } from 'react-hook-form';
import { useEffect } from 'react';
import { useQuery } from '@apollo/client';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';

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

export const SyncDealConfigForm = ({
  form,
  onSubmit,
  loading,
}: {
  form: UseFormReturn<ConfigFormValues>;
  onSubmit: (data: ConfigFormValues) => void;
  loading: boolean;
}) => {
  const { t } = useTranslation('accounting');
  const { boardId, pipelineId } = usePipelineReset(form);

  const { data: pipelineDetail, refetch: pipelineRefetch } = useQuery(
    PIPELINE_DETAIL,
    {
      variables: { _id: pipelineId },
      skip: !pipelineId, // pipelineId байхгүй үед асуухгүй
      fetchPolicy: 'network-only', // заавал backend-ээс авна
    },
  );

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
  const paymentTypes: TPaymentType[] =
    pipelineDetail?.salesPipelineDetail?.paymentTypes || [];
  const mongolianEnabled = isEnabled('mongolian');

  const handleSubmit = (data: ConfigFormValues) =>
    onSubmit(normalizeSyncConfigData(data, mongolianEnabled));

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className="flex flex-col flex-1 min-h-0 bg-background"
      >
        <div className="flex-1 min-h-0 overflow-y-auto p-5 space-y-5">
          <SyncSettingSection title={t('general')}>
            <SyncConfigGeneralFields control={form.control} />
          </SyncSettingSection>

          <SyncConfigPipelineSection
            boardId={boardId}
            pipelineId={pipelineId}
            form={form}
          />

          <SyncConfigAccountsSection control={form.control} />
          <SyncConfigPaymentsSection
            control={form.control}
            paymentTypes={paymentTypes}
            paymentKey={pipelineId || ''}
          />
          <SyncConfigVatCtaxSection control={form.control} />
        </div>
        <SyncConfigFormFooter loading={loading} />
      </form>
    </Form>
  );
};

export { SyncSettingSection } from './SyncSettingSection';
