import {
  SyncConfigFormFooter,
  SyncConfigGeneralFields,
  SyncConfigPaymentAccountField,
  SyncConfigPipelineSection,
  SyncConfigReturnTypeField,
  usePipelineReset,
  useSyncConfigInvalidToast,
} from './SyncConfigFormSections';

import { Form } from 'erxes-ui';
import { SyncSettingSection } from './SyncSettingSection';
import { TR_STATUSES } from '@/transactions/types/constants';
import { UseFormReturn } from 'react-hook-form';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { TSyncDealReturnConfigFormValues } from '@/settings/syncSettings/syncConfigSchema';

type ConfigFormValues = TSyncDealReturnConfigFormValues;

export const SyncDealReturnConfigForm = ({
  form,
  onSubmit,
  loading,
  onCancel,
}: {
  form: UseFormReturn<ConfigFormValues>;
  onSubmit: (data: ConfigFormValues) => void;
  loading: boolean;
  onCancel: () => void;
}) => {
  const { t } = useTranslation('accounting');
  const showInvalidToast = useSyncConfigInvalidToast();
  const { boardId, pipelineId } = usePipelineReset(form);

  useEffect(() => {
    if (!form.getValues('trStatus')) {
      form.setValue('trStatus', TR_STATUSES.COMPLETE);
    }
  }, [form]);

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit, showInvalidToast)}
        className="flex flex-col flex-1 min-h-0 bg-background"
      >
        <div className="@container flex-1 min-h-0 overflow-y-auto p-3 space-y-4">
          <SyncSettingSection title={t('general')}>
            <SyncConfigGeneralFields control={form.control} />
            <SyncConfigReturnTypeField control={form.control} />
          </SyncSettingSection>

          <SyncConfigPipelineSection
            boardId={boardId}
            pipelineId={pipelineId}
            form={form}
          />

          <SyncSettingSection title={t('Payments')}>
            <SyncConfigPaymentAccountField
              control={form.control}
              name="defaultPayment.accountId"
              label={t('return-payment-account')}
            />
          </SyncSettingSection>
        </div>
        <SyncConfigFormFooter loading={loading} onCancel={onCancel} />
      </form>
    </Form>
  );
};
