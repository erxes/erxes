import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { UseFormReturn } from 'react-hook-form';
import {
  AdjustDescriptionField,
  AdjustRateAccountFields,
  AdjustRateCurrencyFields,
  useAdjustSpotRate,
} from '@/adjustments/components/AdjustPanelFields';
import { ADJUST_FUND_RATE_CONTENT_TYPE } from '@/adjustments/constants/adjustmentPanel';
import { TAdjustFundRateForm } from '@/adjustments/rate/types/adjustFundRateSchema';
import { SettingsPanelAddButton } from '@/settings/components/panel/SettingsPanelActions';
import { SettingsPanelDraftForm } from '@/settings/components/panel/SettingsPanelLayout';

export const AddAdjustFundRate = () => {
  const { t } = useTranslation('accounting');

  return (
    <SettingsPanelAddButton
      contentType={ADJUST_FUND_RATE_CONTENT_TYPE}
      label={t('Add Fund Rate Adjustment')}
    />
  );
};

export const AdjustFundRateForm = ({
  form,
  onSubmit,
  onCancel,
  saving,
}: {
  form: UseFormReturn<TAdjustFundRateForm>;
  onSubmit: (data: TAdjustFundRateForm) => void;
  onCancel: () => void;
  saving: boolean;
}) => {
  const { control } = form;
  const date = form.watch('date');
  const mainCurrency = form.watch('mainCurrency');
  const currency = form.watch('currency');

  useAdjustSpotRate(
    { date, currency, mainCurrency },
    useCallback((spotRate) => form.setValue('spotRate', spotRate), [form]),
  );

  return (
    <SettingsPanelDraftForm
      form={form}
      onSubmit={onSubmit}
      onCancel={onCancel}
      saving={saving}
    >
      <AdjustRateCurrencyFields control={control} />
      <AdjustRateAccountFields control={control} />
      <AdjustDescriptionField control={control} />
    </SettingsPanelDraftForm>
  );
};
