import { useTranslation } from 'react-i18next';
import { UseFormReturn } from 'react-hook-form';
import { Form, Input } from 'erxes-ui';
import { PANEL_INPUT_CLASS_NAME, PanelFormRow } from 'ui-modules';
import { SelectFixedAssetCategory } from '@/settings/fixed-assets/components/SelectFixedAssetCategory';
import { FIXED_ASSET_DEPRECIATION_METHODS } from '@/settings/fixed-assets/constants/depreciationMethods';
import { TFixedAssetCategoryForm } from '@/settings/fixed-assets/types/FixedAsset';
import {
  getRateFromUsefulLife,
  getUsefulLifeFromRate,
} from '@/settings/fixed-assets/utils/depreciationRate';
import {
  SettingsPanelDescriptionInput,
  SettingsPanelSelect,
} from '@/settings/components/panel/SettingsPanelFields';
import { SettingsPanelDraftForm } from '@/settings/components/panel/SettingsPanelLayout';
import { SETTINGS_PANEL_CELL_CLASS_NAME } from '@/settings/constants/settingsPanel';

const NumberInput = ({
  field,
  onValueChange,
}: {
  field: { value?: number; onChange: (value?: number) => void };
  onValueChange?: (value?: number) => void;
}) => (
  <Input
    type="number"
    value={field.value ?? ''}
    className={PANEL_INPUT_CLASS_NAME}
    onChange={(event) => {
      const value =
        event.target.value === '' ? undefined : event.target.valueAsNumber;

      field.onChange(value);
      onValueChange?.(value);
    }}
  />
);

export const FixedAssetCategoryForm = ({
  form,
  handleSubmit,
  onCancel,
  loading,
}: {
  form: UseFormReturn<TFixedAssetCategoryForm>;
  handleSubmit: (data: TFixedAssetCategoryForm) => void;
  onCancel: () => void;
  loading: boolean;
}) => {
  const { t } = useTranslation('accounting');
  const methodOptions = FIXED_ASSET_DEPRECIATION_METHODS.map((method) => ({
    value: method.value,
    label: t(method.label || '', { nsSeparator: false }),
  }));

  return (
    <SettingsPanelDraftForm
      form={form}
      onSubmit={handleSubmit}
      onCancel={onCancel}
      saving={loading}
      saveLabel={t('save-category')}
    >
      <Form.Field
        control={form.control}
        name="parentId"
        render={({ field }) => (
          <PanelFormRow label={t('parent-category')}>
            <SelectFixedAssetCategory
              recordId={field.value}
              selected={field.value}
              onSelect={field.onChange}
              variant="ghost"
              hideChevron
              className={SETTINGS_PANEL_CELL_CLASS_NAME}
              nullable
            />
          </PanelFormRow>
        )}
      />
      <Form.Field
        control={form.control}
        name="code"
        render={({ field, fieldState }) => (
          <PanelFormRow
            label={t('code')}
            required
            error={fieldState.error?.message}
          >
            <Input {...field} className={PANEL_INPUT_CLASS_NAME} />
          </PanelFormRow>
        )}
      />
      <Form.Field
        control={form.control}
        name="name"
        render={({ field, fieldState }) => (
          <PanelFormRow
            label={t('name')}
            required
            error={fieldState.error?.message}
          >
            <Input {...field} className={PANEL_INPUT_CLASS_NAME} />
          </PanelFormRow>
        )}
      />
      <Form.Field
        control={form.control}
        name="depreciationMethod"
        render={({ field }) => (
          <PanelFormRow label={t('depreciation-method')}>
            <SettingsPanelSelect
              value={field.value}
              placeholder={t('select-depreciation-method')}
              options={methodOptions}
              onValueChange={field.onChange}
            />
          </PanelFormRow>
        )}
      />
      <Form.Field
        control={form.control}
        name="defaultUsefulLife"
        render={({ field }) => (
          <PanelFormRow label={t('useful-life-in-years')}>
            <NumberInput
              field={field}
              onValueChange={(value) =>
                form.setValue(
                  'defaultAnnualDepreciationRate',
                  getRateFromUsefulLife(value),
                  {
                    shouldDirty: true,
                    shouldValidate: true,
                  },
                )
              }
            />
          </PanelFormRow>
        )}
      />
      <Form.Field
        control={form.control}
        name="defaultAnnualDepreciationRate"
        render={({ field }) => (
          <PanelFormRow label={t('annual-depreciation-rate')}>
            <NumberInput
              field={field}
              onValueChange={(value) =>
                form.setValue(
                  'defaultUsefulLife',
                  getUsefulLifeFromRate(value),
                  {
                    shouldDirty: true,
                    shouldValidate: true,
                  },
                )
              }
            />
          </PanelFormRow>
        )}
      />
      <Form.Field
        control={form.control}
        name="defaultSalvageValue"
        render={({ field }) => (
          <PanelFormRow label={t('residual-value')}>
            <NumberInput field={field} />
          </PanelFormRow>
        )}
      />
      <Form.Field
        control={form.control}
        name="taxDepreciationMethod"
        render={({ field }) => (
          <PanelFormRow label={t('tax-depreciation-method')}>
            <SettingsPanelSelect
              value={field.value}
              placeholder={t('select-tax-depreciation-method')}
              options={methodOptions}
              onValueChange={field.onChange}
            />
          </PanelFormRow>
        )}
      />
      <Form.Field
        control={form.control}
        name="defaultTaxUsefulLife"
        render={({ field }) => (
          <PanelFormRow label={t('tax-useful-life-in-years')}>
            <NumberInput
              field={field}
              onValueChange={(value) =>
                form.setValue(
                  'defaultTaxAnnualDepreciationRate',
                  getRateFromUsefulLife(value),
                  {
                    shouldDirty: true,
                    shouldValidate: true,
                  },
                )
              }
            />
          </PanelFormRow>
        )}
      />
      <Form.Field
        control={form.control}
        name="defaultTaxAnnualDepreciationRate"
        render={({ field }) => (
          <PanelFormRow label={t('annual-tax-depreciation-rate')}>
            <NumberInput
              field={field}
              onValueChange={(value) =>
                form.setValue(
                  'defaultTaxUsefulLife',
                  getUsefulLifeFromRate(value),
                  {
                    shouldDirty: true,
                    shouldValidate: true,
                  },
                )
              }
            />
          </PanelFormRow>
        )}
      />
      <Form.Field
        control={form.control}
        name="defaultTaxSalvageValue"
        render={({ field }) => (
          <PanelFormRow label={t('tax-residual-value')}>
            <NumberInput field={field} />
          </PanelFormRow>
        )}
      />
      <Form.Field
        control={form.control}
        name="description"
        render={({ field }) => (
          <SettingsPanelDescriptionInput
            value={field.value}
            onChange={field.onChange}
          />
        )}
      />
    </SettingsPanelDraftForm>
  );
};
