import { parsePaymentTypes } from './paymentTypes';
import { toGraphqlView } from '@/utils/graphql';
import { Form, isEnabled } from 'erxes-ui';
import { PANEL_INPUT_CLASS_NAME, PanelFormRow } from 'ui-modules';
import { POS_DETAIL, POS_LIST } from '../graphql/queries/relatedQueries';
import { SettingsPanelDraftForm } from '@/settings/components/panel/SettingsPanelLayout';
import { SettingsPanelSelect } from '@/settings/components/panel/SettingsPanelFields';
import {
  SyncConfigAccountsSection,
  SyncConfigGeneralFields,
  SyncConfigPaymentsSection,
  SyncConfigReturnTypeField,
  SyncConfigVatCtaxSection,
  normalizeSyncConfigData,
} from './SyncConfigFormSections';
import { UseFormReturn, useWatch } from 'react-hook-form';
import { useEffect, useMemo } from 'react';

import { SyncSettingSection } from './SyncSettingSection';
import { TR_STATUSES } from '@/transactions/types/constants';
import { useQuery } from '@apollo/client';
import { useTranslation } from 'react-i18next';
import { TSyncOrderConfigFormValues } from '@/settings/syncSettings/syncConfigSchema';

type ConfigFormValues = TSyncOrderConfigFormValues;

export const SyncOrderConfigForm = ({
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
  const posId = useWatch({ control: form.control, name: 'posId' });

  const { data: rawGraphqlPosList, loading: posListLoading } = useQuery(
    POS_LIST,
    {},
  );
  const posList = toGraphqlView(rawGraphqlPosList);
  const posOptions: { value: string; label: string }[] = useMemo(() => {
    if (posListLoading) return [];
    return (posList?.posList ?? []).map((p) => ({
      label: p.name || '-',
      value: p._id,
    }));
  }, [posList, posListLoading]);

  const { data: rawGraphqlPosDetailData, refetch: posRefetch } = useQuery(
    POS_DETAIL,
    {
      variables: { _id: posId ?? '' },
      skip: !posId, // posId байхгүй үед асуухгүй
      fetchPolicy: 'network-only', // заавал backend-ээс авна
    },
  );
  const posDetailData = toGraphqlView(rawGraphqlPosDetailData);

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
  const paymentTypes = parsePaymentTypes(
    posDetailData?.posDetail?.paymentTypes,
  );
  const mongolianEnabled = isEnabled('mongolian');

  const handleSubmit = (data: ConfigFormValues) =>
    onSubmit(normalizeSyncConfigData(data, mongolianEnabled));

  return (
    <SettingsPanelDraftForm
      form={form}
      onSubmit={handleSubmit}
      onCancel={onCancel}
      saving={loading}
    >
      <SyncSettingSection title={t('general')}>
        <SyncConfigGeneralFields control={form.control} />
        <SyncConfigReturnTypeField control={form.control} />
      </SyncSettingSection>

      <SyncSettingSection title="POS">
        <Form.Field
          control={form.control}
          name="posId"
          render={({ field, fieldState }) => (
            <PanelFormRow label={t('POS')} error={fieldState.error?.message}>
              <SettingsPanelSelect
                value={field.value}
                placeholder={t('select-pos')}
                options={posOptions.map((opt) => ({
                  value: opt.value,
                  label: t(opt.label || '', { nsSeparator: false }),
                }))}
                onValueChange={field.onChange}
                className={PANEL_INPUT_CLASS_NAME}
              />
            </PanelFormRow>
          )}
        />
      </SyncSettingSection>

      <SyncConfigAccountsSection control={form.control} />
      <SyncConfigPaymentsSection
        control={form.control}
        paymentTypes={paymentTypes}
        paymentKey={posId || ''}
        currency="MNT"
      />
      <SyncConfigVatCtaxSection control={form.control} />
    </SettingsPanelDraftForm>
  );
};

export { SyncSettingSection } from './SyncSettingSection';
