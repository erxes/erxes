import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Control, FieldValues, Path } from 'react-hook-form';
import { CurrencyField, DatePicker, Form } from 'erxes-ui';
import {
  PANEL_INPUT_CLASS_NAME,
  PanelFormRow,
  SelectBranches,
  SelectDepartments,
} from 'ui-modules';
import { SelectAccount } from '@/settings/account/components/SelectAccount';
import { SettingsPanelDescriptionInput } from '@/settings/components/panel/SettingsPanelFields';
import { SETTINGS_PANEL_CELL_CLASS_NAME } from '@/settings/constants/settingsPanel';
import {
  getCurrencyCodeFromOptions,
  useCurrencyConfigs,
} from '@/settings/hooks/useCurrencyConfigs';
import { useGetExchangeRate } from '@/transactions/transaction-form/hooks/useGetExchangeRate';

type TAdjustRateFields = FieldValues & {
  mainCurrency: string;
  currency: string;
  spotRate: number;
  date: Date;
  gainAccountId: string;
  lossAccountId: string;
};

const CURRENCY_FIELDS = [
  { name: 'mainCurrency', label: 'Main Currency' },
  { name: 'currency', label: 'Foreign Currency' },
] as const;

const ACCOUNT_FIELDS = [
  { name: 'gainAccountId', label: 'Gain Account' },
  { name: 'lossAccountId', label: 'Loss Account' },
] as const;

export const useAdjustSpotRate = (
  {
    date,
    currency,
    mainCurrency,
  }: { date?: Date; currency?: string; mainCurrency?: string },
  setSpotRate: (spotRate: number) => void,
) => {
  const { spotRate: fetchedSpotRate } = useGetExchangeRate({
    variables: {
      date,
      currency,
      mainCurrency,
    },
    skip: !date || !mainCurrency || !currency,
  });

  useEffect(() => {
    if (fetchedSpotRate && fetchedSpotRate > 0) {
      setSpotRate(fetchedSpotRate);
    }
  }, [fetchedSpotRate, setSpotRate]);
};

export const AdjustBranchDepartmentFields = <
  TForm extends FieldValues & { branchId?: string; departmentId?: string },
>({
  control,
  scope,
}: {
  control: Control<TForm>;
  scope: string;
}) => {
  const { t } = useTranslation('accounting');

  return (
    <>
      <Form.Field
        control={control}
        name={'branchId' as Path<TForm>}
        render={({ field }) => (
          <PanelFormRow label={t('branch')}>
            <SelectBranches.InlineCell
              mode="single"
              scope={`${scope}.branch`}
              value={field.value ?? ''}
              onValueChange={field.onChange}
            />
          </PanelFormRow>
        )}
      />
      <Form.Field
        control={control}
        name={'departmentId' as Path<TForm>}
        render={({ field }) => (
          <PanelFormRow label={t('department')}>
            <SelectDepartments.InlineCell
              mode="single"
              scope={`${scope}.department`}
              value={field.value ?? ''}
              onValueChange={field.onChange}
            />
          </PanelFormRow>
        )}
      />
    </>
  );
};

export const AdjustDateField = <TForm extends FieldValues & { date: Date }>({
  control,
  required,
}: {
  control: Control<TForm>;
  required?: boolean;
}) => {
  const { t } = useTranslation('accounting');

  return (
    <Form.Field
      control={control}
      name={'date' as Path<TForm>}
      render={({ field, fieldState }) => (
        <PanelFormRow
          label={t('date')}
          required={required}
          error={fieldState.error?.message}
        >
          <DatePicker
            value={field.value}
            onChange={(date) => date instanceof Date && field.onChange(date)}
            className={PANEL_INPUT_CLASS_NAME}
          />
        </PanelFormRow>
      )}
    />
  );
};

export const AdjustDescriptionField = <
  TForm extends FieldValues & { description?: string | null },
>({
  control,
}: {
  control: Control<TForm>;
}) => (
  <Form.Field
    control={control}
    name={'description' as Path<TForm>}
    render={({ field, fieldState }) => (
      <div className="flex flex-col gap-0.5">
        <SettingsPanelDescriptionInput
          value={field.value ?? ''}
          onChange={field.onChange}
        />
        {fieldState.error && (
          <span className="text-xs text-destructive">
            {fieldState.error.message}
          </span>
        )}
      </div>
    )}
  />
);

export const AdjustRateCurrencyFields = <TForm extends TAdjustRateFields>({
  control,
}: {
  control: Control<TForm>;
}) => {
  const { t } = useTranslation('accounting');
  const { dealCurrencyOptions } = useCurrencyConfigs();

  return (
    <>
      {CURRENCY_FIELDS.map(({ name, label }) => (
        <Form.Field
          key={name}
          control={control}
          name={name as Path<TForm>}
          render={({ field, fieldState }) => (
            <PanelFormRow
              label={t(label)}
              required
              error={fieldState.error?.message}
            >
              <CurrencyField.SelectCurrency
                value={getCurrencyCodeFromOptions(
                  field.value,
                  dealCurrencyOptions,
                )}
                onChange={field.onChange}
                variant="ghost"
                hideChevron
                className={SETTINGS_PANEL_CELL_CLASS_NAME}
                currencies={dealCurrencyOptions}
              />
            </PanelFormRow>
          )}
        />
      ))}
      <Form.Field
        control={control}
        name={'spotRate' as Path<TForm>}
        render={({ field, fieldState }) => (
          <PanelFormRow
            label={t('Spot Rate')}
            required
            error={fieldState.error?.message}
          >
            <CurrencyField.ValueInput
              value={field.value}
              onChange={field.onChange}
              placeholder="0.00"
              className={PANEL_INPUT_CLASS_NAME}
            />
          </PanelFormRow>
        )}
      />
      <AdjustDateField control={control} required />
    </>
  );
};

export const AdjustRateAccountFields = <TForm extends TAdjustRateFields>({
  control,
}: {
  control: Control<TForm>;
}) => {
  const { t } = useTranslation('accounting');

  return (
    <>
      {ACCOUNT_FIELDS.map(({ name, label }) => (
        <Form.Field
          key={name}
          control={control}
          name={name as Path<TForm>}
          render={({ field, fieldState }) => (
            <PanelFormRow
              label={t(label)}
              required
              error={fieldState.error?.message}
            >
              <SelectAccount
                value={field.value}
                onValueChange={field.onChange}
                defaultFilter={{ journal: 'exchangeDiff' }}
                variant="ghost"
                hideChevron
                className={SETTINGS_PANEL_CELL_CLASS_NAME}
              />
            </PanelFormRow>
          )}
        />
      ))}
    </>
  );
};
