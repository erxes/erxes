import { useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { UseFormReturn } from 'react-hook-form';
import { Form } from 'erxes-ui';
import {
  CustomerType,
  PanelFormRow,
  SelectCompany,
  SelectCustomer,
} from 'ui-modules';
import {
  AdjustDescriptionField,
  AdjustRateAccountFields,
  AdjustBranchDepartmentFields,
  AdjustRateCurrencyFields,
  useAdjustSpotRate,
} from '@/adjustments/components/AdjustPanelFields';
import { ADJUST_DEBT_RATE_CONTENT_TYPE } from '@/adjustments/constants/adjustmentPanel';
import { TAdjustDebtRateForm } from '@/adjustments/debt/types/adjustDebtRateSchema';
import { SettingsPanelAddButton } from '@/settings/components/panel/SettingsPanelActions';
import { SettingsPanelSelect } from '@/settings/components/panel/SettingsPanelFields';
import { SettingsPanelDraftForm } from '@/settings/components/panel/SettingsPanelLayout';

const SCOPE = 'side-panel-adjust-debt-rate';

export const AddAdjustDebtRate = () => {
  const { t } = useTranslation('accounting');

  return (
    <SettingsPanelAddButton
      contentType={ADJUST_DEBT_RATE_CONTENT_TYPE}
      label={t('Add Debt Rate Adjustment')}
    />
  );
};

export const AdjustDebtRateForm = ({
  form,
  onSubmit,
  onCancel,
  saving,
}: {
  form: UseFormReturn<TAdjustDebtRateForm>;
  onSubmit: (data: TAdjustDebtRateForm) => void;
  onCancel: () => void;
  saving: boolean;
}) => {
  const { t } = useTranslation('accounting');
  const { control } = form;
  const date = form.watch('date');
  const mainCurrency = form.watch('mainCurrency');
  const currency = form.watch('currency');
  const customerType = form.watch('customerType');

  useEffect(() => {
    form.setValue('customerId', '');
  }, [customerType, form]);

  useAdjustSpotRate(
    { date, currency, mainCurrency },
    useCallback((spotRate) => form.setValue('spotRate', spotRate), [form]),
  );

  let SelectCustomerComponent = null;
  if (customerType === CustomerType.CUSTOMER) {
    SelectCustomerComponent = SelectCustomer.InlineCell;
  } else if (customerType === CustomerType.COMPANY) {
    SelectCustomerComponent = SelectCompany.InlineCell;
  }

  return (
    <SettingsPanelDraftForm
      form={form}
      onSubmit={onSubmit}
      onCancel={onCancel}
      saving={saving}
    >
      <AdjustRateCurrencyFields control={control} />
      <Form.Field
        control={control}
        name="customerType"
        render={({ field }) => (
          <PanelFormRow label={t('Customer Type (Optional)')}>
            <SettingsPanelSelect
              value={field.value}
              placeholder={t('None - All Customers')}
              options={[
                { value: CustomerType.CUSTOMER, label: t('Customer') },
                { value: CustomerType.COMPANY, label: t('Company') },
              ]}
              onValueChange={(value) => {
                field.onChange(value);
                if (!value) {
                  form.setValue('customerId', '');
                }
              }}
            />
          </PanelFormRow>
        )}
      />
      {SelectCustomerComponent && (
        <Form.Field
          control={control}
          name="customerId"
          render={({ field }) => (
            <PanelFormRow label={t('Customer')}>
              <SelectCustomerComponent
                key={customerType}
                mode="single"
                scope={`${SCOPE}.customer`}
                value={field.value ?? ''}
                onValueChange={field.onChange}
              />
            </PanelFormRow>
          )}
        />
      )}
      <AdjustRateAccountFields control={control} />
      <AdjustBranchDepartmentFields control={control} scope={SCOPE} />
      <AdjustDescriptionField control={control} />
    </SettingsPanelDraftForm>
  );
};
