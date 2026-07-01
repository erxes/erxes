import { TR_STATUSES } from '@/transactions/types/constants';
import { Form } from 'erxes-ui';
import { useEffect } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import {
  SyncConfigGeneralFields,
  SyncConfigPipelineSection,
  SyncConfigFormFooter,
  usePipelineReset,
  SyncConfigPaymentAccountField,
  SyncConfigReturnTypeField,
} from './SyncConfigFormSections';
import { SyncSettingSection } from './SyncSettingSection';

export const syncDealReturnConfigFormSchema = z.object({
  title: z.string(),
  boardId: z.string().optional(),
  pipelineId: z.string().optional(),
  stageId: z.string(),
  responseFieldId: z.string().optional(),
  returnType: z.enum(['fullTr', 'onlySale', 'delete']),
  dateRule: z.enum(['alwaysNow', 'syncedDateOrNow']),
  trStatus: z.string().optional(),
  defaultPayment: z
    .object({
      accountId: z.string(),
    })
    .nullable(),
});

type ConfigFormValues = z.infer<typeof syncDealReturnConfigFormSchema>;

export const SyncDealReturnConfigForm = ({
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

  useEffect(() => {
    if (!form.getValues('trStatus')) {
      form.setValue('trStatus', TR_STATUSES.COMPLETE);
    }
  }, [form]);

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col flex-1 min-h-0 bg-background"
      >
        <div className="flex-1 min-h-0 overflow-y-auto p-5 space-y-5">
          <SyncSettingSection title={t('general')}>
            <SyncConfigGeneralFields />
            <SyncConfigReturnTypeField />
          </SyncSettingSection>

          <SyncConfigPipelineSection
            boardId={boardId}
            pipelineId={pipelineId}
            form={form}
          />

          <SyncSettingSection title={t('Payments')}>
            <SyncConfigPaymentAccountField
              name="defaultPayment.accountId"
              label={t('return-payment-account')}
            />
          </SyncSettingSection>
        </div>
        <SyncConfigFormFooter loading={loading} />
      </form>
    </Form>
  );
};
