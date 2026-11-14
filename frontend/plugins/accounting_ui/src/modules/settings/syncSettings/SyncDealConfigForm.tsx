import { parsePaymentTypes } from './paymentTypes';
import { toGraphqlView } from '@/utils/graphql';
import { isEnabled } from 'erxes-ui';
import { SettingsPanelDraftForm } from '@/settings/components/panel/SettingsPanelLayout';
import {
  SyncConfigAccountsSection,
  SyncConfigGeneralFields,
  SyncConfigPaymentsSection,
  SyncConfigPipelineSection,
  SyncConfigVatCtaxSection,
  normalizeSyncConfigData,
  usePipelineReset,
  useSyncConfigInvalidToast,
} from './SyncConfigFormSections';

import { PIPELINE_DETAIL } from '../graphql/queries/relatedQueries';
import { SyncSettingSection } from './SyncSettingSection';
import { TR_STATUSES } from '@/transactions/types/constants';
import { UseFormReturn } from 'react-hook-form';
import { useEffect } from 'react';
import { useQuery } from '@apollo/client';
import { useTranslation } from 'react-i18next';
import { TSyncDealConfigFormValues } from '@/settings/syncSettings/syncConfigSchema';

type ConfigFormValues = TSyncDealConfigFormValues;

export const SyncDealConfigForm = ({
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

  const { data: rawGraphqlPipelineDetail, refetch: pipelineRefetch } = useQuery(
    PIPELINE_DETAIL,
    {
      variables: { _id: pipelineId ?? '' },
      skip: !pipelineId, // pipelineId байхгүй үед асуухгүй
      fetchPolicy: 'network-only', // заавал backend-ээс авна
    },
  );
  const pipelineDetail = toGraphqlView(rawGraphqlPipelineDetail);

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
  const paymentTypes = parsePaymentTypes(
    pipelineDetail?.salesPipelineDetail?.paymentTypes,
  );
  const mongolianEnabled = isEnabled('mongolian');

  const handleSubmit = (data: ConfigFormValues) =>
    onSubmit(normalizeSyncConfigData(data, mongolianEnabled));

  return (
    <SettingsPanelDraftForm
      form={form}
      onSubmit={handleSubmit}
      onInvalid={showInvalidToast}
      onCancel={onCancel}
      saving={loading}
    >
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
    </SettingsPanelDraftForm>
  );
};

export { SyncSettingSection } from './SyncSettingSection';
