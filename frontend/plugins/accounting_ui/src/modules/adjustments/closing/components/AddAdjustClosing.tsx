import { useTranslation } from 'react-i18next';
import { UseFormReturn } from 'react-hook-form';
import { DatePicker, Form, Input } from 'erxes-ui';
import { PANEL_INPUT_CLASS_NAME, PanelFormRow } from 'ui-modules';
import {
  AdjustDateField,
  AdjustDescriptionField,
} from '@/adjustments/components/AdjustPanelFields';
import { TAdjustClosingForm } from '@/adjustments/closing/types/adjustClosingForm';
import { ADJUST_CLOSING_CONTENT_TYPE } from '@/adjustments/constants/adjustmentPanel';
import { SelectAccount } from '@/settings/account/components/SelectAccount';
import { SettingsPanelAddButton } from '@/settings/components/panel/SettingsPanelActions';
import { SettingsPanelDraftForm } from '@/settings/components/panel/SettingsPanelLayout';
import { SETTINGS_PANEL_CELL_CLASS_NAME } from '@/settings/constants/settingsPanel';

const ACCOUNT_FIELDS = [
  { name: 'integrateAccountId', label: 'Integrate account' },
  { name: 'periodGLAccountId', label: 'Period GL account' },
  { name: 'earningAccountId', label: 'Earning account' },
  { name: 'taxPayableAccountId', label: 'Tax payable account' },
] as const;

const ENTRY_NUMBER_FIELDS = [
  { name: 'balance', label: 'Balance' },
  { name: 'percent', label: 'Percent' },
] as const;

const ENTRY_ACCOUNT_FIELDS = [
  { name: 'mainAccTrId', label: 'Main Transaction' },
  { name: 'integrateTrId', label: 'Integrate Transaction' },
] as const;

export const AddAdjustClosing = () => {
  const { t } = useTranslation('accounting');

  return (
    <SettingsPanelAddButton
      contentType={ADJUST_CLOSING_CONTENT_TYPE}
      label={t('Add Closing Adjustment')}
    />
  );
};

export const AdjustClosingForm = ({
  form,
  onSubmit,
  onCancel,
  saving,
  isNew,
}: {
  form: UseFormReturn<TAdjustClosingForm>;
  onSubmit: (data: TAdjustClosingForm) => void;
  onCancel: () => void;
  saving: boolean;
  isNew?: boolean;
}) => {
  const { t } = useTranslation('accounting');

  return (
    <SettingsPanelDraftForm
      form={form}
      onSubmit={onSubmit}
      onCancel={onCancel}
      saving={saving}
    >
      <AdjustDateField control={form.control} required={isNew} />
      {!isNew && (
        <Form.Field
          control={form.control}
          name="beginDate"
          render={({ field }) => (
            <PanelFormRow label={t('Begin date')}>
              <DatePicker
                value={field.value ?? undefined}
                onChange={field.onChange}
                className={PANEL_INPUT_CLASS_NAME}
              />
            </PanelFormRow>
          )}
        />
      )}
      {ACCOUNT_FIELDS.map(({ name, label }) => (
        <Form.Field
          key={name}
          control={form.control}
          name={name}
          render={({ field, fieldState }) => (
            <PanelFormRow
              label={t(label)}
              required={isNew}
              error={fieldState.error?.message}
            >
              <SelectAccount
                value={field.value ?? undefined}
                onValueChange={field.onChange}
                variant="ghost"
                hideChevron
                className={SETTINGS_PANEL_CELL_CLASS_NAME}
              />
            </PanelFormRow>
          )}
        />
      ))}
      <AdjustDescriptionField control={form.control} />
      {!isNew && (
        <>
          <Form.Field
            control={form.control}
            name="accountId"
            render={({ field }) => (
              <PanelFormRow label={t('account')}>
                <SelectAccount
                  value={field.value ?? undefined}
                  onValueChange={field.onChange}
                  variant="ghost"
                  hideChevron
                  className={SETTINGS_PANEL_CELL_CLASS_NAME}
                />
              </PanelFormRow>
            )}
          />
          {ENTRY_NUMBER_FIELDS.map(({ name, label }) => (
            <Form.Field
              key={name}
              control={form.control}
              name={name}
              render={({ field }) => (
                <PanelFormRow label={t(label)}>
                  <Input
                    type="number"
                    placeholder={t(label)}
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                    className={PANEL_INPUT_CLASS_NAME}
                  />
                </PanelFormRow>
              )}
            />
          ))}
          {ENTRY_ACCOUNT_FIELDS.map(({ name, label }) => (
            <Form.Field
              key={name}
              control={form.control}
              name={name}
              render={({ field }) => (
                <PanelFormRow label={t(label)}>
                  <SelectAccount
                    value={field.value ?? undefined}
                    onValueChange={field.onChange}
                    variant="ghost"
                    hideChevron
                    className={SETTINGS_PANEL_CELL_CLASS_NAME}
                  />
                </PanelFormRow>
              )}
            />
          ))}
        </>
      )}
    </SettingsPanelDraftForm>
  );
};
