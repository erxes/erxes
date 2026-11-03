import { useTranslation } from 'react-i18next';
import { JournalEnum } from '@/settings/account/types/Account';
import { CurrencyField, Form, Input } from 'erxes-ui';
import {
  PANEL_INPUT_CLASS_NAME,
  PanelFormRow,
  SelectBranches,
  SelectDepartments,
} from 'ui-modules';
import { UseFormReturn, useWatch } from 'react-hook-form';

import { SETTINGS_PANEL_CELL_CLASS_NAME } from '@/settings/constants/settingsPanel';
import {
  SettingsPanelDescriptionInput,
  SettingsPanelSelect,
  SettingsPanelSwitch,
} from '@/settings/components/panel/SettingsPanelFields';
import { SettingsPanelDraftForm } from '@/settings/components/panel/SettingsPanelLayout';
import { SelectAccountCategory } from '@/settings/account/account-categories/components/SelectAccountCategory';
import { TAccountForm } from '@/settings/account/types/accountForm';
import {
  getAccountJournalOptions,
  getAccountKindOptions,
} from '@/settings/account/utils/accountOptions';
import {
  getCurrencyCodeFromOptions,
  useCurrencyConfigs,
} from '@/settings/hooks/useCurrencyConfigs';

const SCOPE = 'side-panel-account-new';

const AccountFormFields = ({
  control,
}: {
  control: UseFormReturn<TAccountForm>['control'];
}) => {
  const { t } = useTranslation('accounting');
  const { dealCurrencyOptions } = useCurrencyConfigs();
  const journal = useWatch({ control, name: 'journal' });

  return (
    <>
      <Form.Field
        control={control}
        name="name"
        render={({ field, fieldState }) => (
          <PanelFormRow
            label={t('name')}
            required
            error={fieldState.error?.message}
          >
            <Input
              {...field}
              autoFocus
              autoComplete="off"
              placeholder={t('enter-account-name')}
              className={PANEL_INPUT_CLASS_NAME}
            />
          </PanelFormRow>
        )}
      />

      <Form.Field
        control={control}
        name="code"
        render={({ field, fieldState }) => (
          <PanelFormRow
            label={t('code')}
            required
            error={fieldState.error?.message}
          >
            <Input
              {...field}
              autoComplete="off"
              placeholder={t('enter-account-code')}
              className={PANEL_INPUT_CLASS_NAME}
            />
          </PanelFormRow>
        )}
      />

      <Form.Field
        control={control}
        name="categoryId"
        render={({ field, fieldState }) => (
          <PanelFormRow
            label={t('category')}
            required
            error={fieldState.error?.message}
          >
            <SelectAccountCategory
              selected={field.value}
              onSelect={field.onChange}
              recordId={`${SCOPE}.category`}
              variant="ghost"
              hideChevron
              className={SETTINGS_PANEL_CELL_CLASS_NAME}
              allowCreate
            />
          </PanelFormRow>
        )}
      />

      <Form.Field
        control={control}
        name="currency"
        render={({ field, fieldState }) => (
          <PanelFormRow
            label={t('currency')}
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

      <Form.Field
        control={control}
        name="kind"
        render={({ field, fieldState }) => (
          <PanelFormRow
            label={t('type')}
            required
            error={fieldState.error?.message}
          >
            <SettingsPanelSelect
              value={field.value}
              placeholder={t('select-type')}
              options={getAccountKindOptions(t)}
              onValueChange={field.onChange}
              className={PANEL_INPUT_CLASS_NAME}
            />
          </PanelFormRow>
        )}
      />

      <Form.Field
        control={control}
        name="journal"
        render={({ field, fieldState }) => (
          <PanelFormRow
            label={t('journal')}
            required
            error={fieldState.error?.message}
          >
            <SettingsPanelSelect
              value={field.value}
              placeholder={t('select-journal')}
              options={getAccountJournalOptions(t)}
              onValueChange={field.onChange}
              className={PANEL_INPUT_CLASS_NAME}
            />
          </PanelFormRow>
        )}
      />

      {journal === JournalEnum.BANK && (
        <>
          <Form.Field
            control={control}
            name="extra.bank"
            render={({ field, fieldState }) => (
              <PanelFormRow
                label={t('bank-label')}
                required
                error={fieldState.error?.message}
              >
                <Input
                  {...field}
                  value={field.value ?? ''}
                  placeholder={t('enter-bank-name')}
                  className={PANEL_INPUT_CLASS_NAME}
                />
              </PanelFormRow>
            )}
          />

          <Form.Field
            control={control}
            name="extra.bankAccount"
            render={({ field, fieldState }) => (
              <PanelFormRow
                label={t('bank-account')}
                required
                error={fieldState.error?.message}
              >
                <Input
                  {...field}
                  value={field.value ?? ''}
                  placeholder={t('enter-bank-account-number')}
                  className={PANEL_INPUT_CLASS_NAME}
                />
              </PanelFormRow>
            )}
          />
        </>
      )}

      <Form.Field
        control={control}
        name="branchId"
        render={({ field }) => (
          <PanelFormRow label={t('branch')}>
            <SelectBranches.InlineCell
              mode="single"
              scope={`${SCOPE}.branch`}
              value={field.value}
              onValueChange={field.onChange}
            />
          </PanelFormRow>
        )}
      />

      <Form.Field
        control={control}
        name="departmentId"
        render={({ field }) => (
          <PanelFormRow label={t('department')}>
            <SelectDepartments.InlineCell
              mode="single"
              scope={`${SCOPE}.department`}
              value={field.value}
              onValueChange={field.onChange}
            />
          </PanelFormRow>
        )}
      />

      <Form.Field
        control={control}
        name="isTemp"
        render={({ field }) => (
          <PanelFormRow label={t('temporary-account')}>
            <SettingsPanelSwitch
              checked={field.value}
              onCheckedChange={field.onChange}
            />
          </PanelFormRow>
        )}
      />

      <Form.Field
        control={control}
        name="isOutBalance"
        render={({ field }) => (
          <PanelFormRow label={t('off-balance-sheet')}>
            <SettingsPanelSwitch
              checked={field.value}
              onCheckedChange={field.onChange}
            />
          </PanelFormRow>
        )}
      />

      <Form.Field
        control={control}
        name="description"
        render={({ field }) => (
          <SettingsPanelDescriptionInput
            value={field.value}
            onChange={field.onChange}
          />
        )}
      />
    </>
  );
};

export const AccountForm = ({
  form,
  onSubmit,
  onCancel,
  saving,
}: {
  form: UseFormReturn<TAccountForm>;
  onSubmit: (data: TAccountForm) => void;
  onCancel: () => void;
  saving: boolean;
}) => {
  const { t } = useTranslation('accounting');

  return (
    <SettingsPanelDraftForm
      form={form}
      onSubmit={onSubmit}
      onCancel={onCancel}
      saving={saving}
      saveLabel={t('save-account')}
    >
      <AccountFormFields control={form.control} />
    </SettingsPanelDraftForm>
  );
};
