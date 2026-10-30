import { useTranslation } from 'react-i18next';
import { FieldErrors, UseFormReturn } from 'react-hook-form';
import { Form, Input, toast } from 'erxes-ui';
import { PANEL_INPUT_CLASS_NAME, PanelFormRow } from 'ui-modules';
import { SettingsPanelDraftForm } from '@/settings/components/panel/SettingsPanelLayout';
import {
  SettingsPanelDescriptionInput,
  SettingsPanelSelect,
} from '@/settings/components/panel/SettingsPanelFields';
import { SETTINGS_PANEL_CELL_CLASS_NAME } from '@/settings/constants/settingsPanel';
import { SelectFixedAssetCategory } from '@/settings/fixed-assets/components/SelectFixedAssetCategory';
import {
  FIXED_ASSET_DEPRECIATION_METHODS,
  FIXED_ASSET_DEPRECIATION_METHOD_VALUES,
} from '@/settings/fixed-assets/constants/depreciationMethods';
import { useFixedAssetCategories } from '@/settings/fixed-assets/hooks/useFixedAssetCategories';
import { TFixedAssetForm } from '@/settings/fixed-assets/types/FixedAsset';
import {
  getRateFromUsefulLife,
  getUsefulLifeFromRate,
} from '@/settings/fixed-assets/utils/depreciationRate';
import { SyncPanelFormRow } from '@/settings/syncSettings/SyncSettingSection';

const NumberInput = ({
  field,
  placeholder,
}: {
  field: { value?: number; onChange: (value?: number) => void };
  placeholder: string;
}) => (
  <Input
    type="number"
    value={field.value ?? ''}
    placeholder={placeholder}
    className={PANEL_INPUT_CLASS_NAME}
    onChange={(event) =>
      field.onChange(
        event.target.value === '' ? undefined : event.target.valueAsNumber,
      )
    }
  />
);

export const FixedAssetForm = ({
  form,
  handleSubmit,
  onCancel,
  loading,
}: {
  form: UseFormReturn<TFixedAssetForm>;
  handleSubmit: (data: TFixedAssetForm) => void;
  onCancel: () => void;
  loading: boolean;
}) => {
  const { t } = useTranslation('accounting');
  const { fixedAssetCategories } = useFixedAssetCategories();
  const methodOptions = FIXED_ASSET_DEPRECIATION_METHODS.map((method) => ({
    value: method.value,
    label: t(method.label || '', { nsSeparator: false }),
  }));

  const getDepreciationMethod = (value?: string) =>
    FIXED_ASSET_DEPRECIATION_METHOD_VALUES.includes(
      value as (typeof FIXED_ASSET_DEPRECIATION_METHOD_VALUES)[number],
    )
      ? (value as (typeof FIXED_ASSET_DEPRECIATION_METHOD_VALUES)[number])
      : undefined;

  const applyCategoryDefaults = (categoryId?: string) => {
    const category = fixedAssetCategories?.find(
      (item) => item._id === categoryId,
    );

    if (!category) {
      return;
    }

    form.setValue(
      'depreciationMethod',
      getDepreciationMethod(category.depreciationMethod),
    );
    form.setValue(
      'usefulLife',
      getUsefulLifeFromRate(category.defaultAnnualDepreciationRate),
    );
    form.setValue(
      'annualDepreciationRate',
      category.defaultAnnualDepreciationRate,
    );
    form.setValue('salvageValue', category.defaultSalvageValue);
    form.setValue(
      'taxDepreciationMethod',
      getDepreciationMethod(category.taxDepreciationMethod),
    );
    form.setValue(
      'taxUsefulLife',
      getUsefulLifeFromRate(category.defaultTaxAnnualDepreciationRate),
    );
    form.setValue(
      'taxAnnualDepreciationRate',
      category.defaultTaxAnnualDepreciationRate,
    );
    form.setValue('taxSalvageValue', category.defaultTaxSalvageValue);
  };

  const handleInvalid = (errors: FieldErrors<TFixedAssetForm>) => {
    const fieldLabels: Partial<Record<keyof TFixedAssetForm, string>> = {
      name: t('name'),
      code: t('code'),
      categoryId: t('category-label'),
      depreciationMethod: t('depreciation-method'),
      usefulLife: t('useful-life'),
      annualDepreciationRate: t('annual-depreciation-rate'),
      salvageValue: t('residual-value'),
      taxDepreciationMethod: t('tax-depreciation-method'),
      taxUsefulLife: t('tax-useful-life'),
      taxSalvageValue: t('tax-residual-value'),
    };
    const invalidFields = Object.keys(errors).map(
      (field) => fieldLabels[field as keyof TFixedAssetForm] || field,
    );

    toast({
      title: t('required-information-is-missing'),
      description: t('fields-to-check', { fields: invalidFields.join(', ') }),
      variant: 'destructive',
    });
  };

  return (
    <SettingsPanelDraftForm
      form={form}
      onSubmit={handleSubmit}
      onInvalid={handleInvalid}
      onCancel={onCancel}
      saving={loading}
      saveLabel={t('save')}
    >
      <Form.Field
        control={form.control}
        name="categoryId"
        render={({ field, fieldState }) => (
          <PanelFormRow
            label={t('category-label')}
            required
            error={fieldState.error?.message}
          >
            <SelectFixedAssetCategory
              selected={field.value}
              onSelect={(categoryId) => {
                field.onChange(categoryId);
                applyCategoryDefaults(categoryId);
              }}
              variant="ghost"
              hideChevron
              className={SETTINGS_PANEL_CELL_CLASS_NAME}
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
            <Input
              {...field}
              placeholder={t('code')}
              className={PANEL_INPUT_CLASS_NAME}
            />
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
            <Input
              {...field}
              placeholder={t('name')}
              className={PANEL_INPUT_CLASS_NAME}
            />
          </PanelFormRow>
        )}
      />
      <Form.Field
        control={form.control}
        name="depreciationMethod"
        render={({ field }) => (
          <SyncPanelFormRow label={t('depreciation-method')}>
            <SettingsPanelSelect
              value={field.value}
              placeholder={t('select-depreciation-method')}
              options={methodOptions}
              onValueChange={field.onChange}
            />
          </SyncPanelFormRow>
        )}
      />
      <Form.Field
        control={form.control}
        name="usefulLife"
        render={({ field }) => (
          <SyncPanelFormRow label={t('useful-life-in-years')}>
            <NumberInput
              placeholder={t('useful-life-in-years')}
              field={{
                ...field,
                onChange: (value?: number) => {
                  field.onChange(value);
                  form.setValue(
                    'annualDepreciationRate',
                    getRateFromUsefulLife(value),
                    { shouldDirty: true, shouldValidate: true },
                  );
                },
              }}
            />
          </SyncPanelFormRow>
        )}
      />
      <Form.Field
        control={form.control}
        name="annualDepreciationRate"
        render={({ field }) => (
          <SyncPanelFormRow label={t('annual-depreciation-rate')}>
            <NumberInput
              placeholder={t('annual-depreciation-rate')}
              field={{
                ...field,
                onChange: (value?: number) => {
                  field.onChange(value);
                  form.setValue('usefulLife', getUsefulLifeFromRate(value), {
                    shouldDirty: true,
                    shouldValidate: true,
                  });
                },
              }}
            />
          </SyncPanelFormRow>
        )}
      />
      <Form.Field
        control={form.control}
        name="salvageValue"
        render={({ field }) => (
          <SyncPanelFormRow label={t('residual-value')}>
            <NumberInput field={field} placeholder={t('residual-value')} />
          </SyncPanelFormRow>
        )}
      />
      <Form.Field
        control={form.control}
        name="taxDepreciationMethod"
        render={({ field }) => (
          <SyncPanelFormRow label={t('tax-depreciation-method')}>
            <SettingsPanelSelect
              value={field.value}
              placeholder={t('select-tax-depreciation-method')}
              options={methodOptions}
              onValueChange={field.onChange}
            />
          </SyncPanelFormRow>
        )}
      />
      <Form.Field
        control={form.control}
        name="taxUsefulLife"
        render={({ field }) => (
          <SyncPanelFormRow label={t('tax-useful-life')}>
            <NumberInput field={field} placeholder={t('tax-useful-life')} />
          </SyncPanelFormRow>
        )}
      />
      <Form.Field
        control={form.control}
        name="taxSalvageValue"
        render={({ field }) => (
          <SyncPanelFormRow label={t('tax-residual-value')}>
            <NumberInput field={field} placeholder={t('tax-residual-value')} />
          </SyncPanelFormRow>
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
