import { useTranslation } from 'react-i18next';
import { UseFormReturn } from 'react-hook-form';
import { Form, Input } from 'erxes-ui';
import { PANEL_INPUT_CLASS_NAME, PanelFormRow } from 'ui-modules';
import {
  SettingsPanelDescriptionInput,
  SettingsPanelNameCodeInputs,
  SettingsPanelSelect,
} from '@/settings/components/panel/SettingsPanelFields';
import { SettingsPanelDraftForm } from '@/settings/components/panel/SettingsPanelLayout';
import { SETTINGS_PANEL_CELL_CLASS_NAME } from '@/settings/constants/settingsPanel';
import { FIXED_ASSET_CATEGORY_DEPRECIATION_FIELDS } from '@/settings/fixed-assets/constants/categoryDepreciationFields';
import { getDepreciationMethodOptions } from '@/settings/fixed-assets/constants/depreciationMethods';
import { SelectFixedAssetCategory } from '@/settings/fixed-assets/components/SelectFixedAssetCategory';
import { TFixedAssetCategoryForm } from '@/settings/fixed-assets/types/FixedAsset';
import {
  getRateFromUsefulLife,
  getUsefulLifeFromRate,
} from '@/settings/fixed-assets/utils/depreciationRate';

type TDepreciationFields =
  (typeof FIXED_ASSET_CATEGORY_DEPRECIATION_FIELDS)[number];

type TNumberFieldName = TDepreciationFields['usefulLife' | 'rate' | 'salvage'];

const NumberFieldRow = ({
  form,
  name,
  label,
  pair,
}: {
  form: UseFormReturn<TFixedAssetCategoryForm>;
  name: TNumberFieldName;
  label: string;
  pair?: {
    name: TNumberFieldName;
    convert: (value?: number) => number | undefined;
  };
}) => (
  <Form.Field
    control={form.control}
    name={name}
    render={({ field, fieldState }) => (
      <PanelFormRow label={label} error={fieldState.error?.message}>
        <Input
          type="number"
          value={field.value ?? ''}
          placeholder={label}
          className={PANEL_INPUT_CLASS_NAME}
          onChange={(event) => {
            const value =
              event.target.value === ''
                ? undefined
                : event.target.valueAsNumber;

            field.onChange(value);

            if (pair) {
              form.setValue(pair.name, pair.convert(value), {
                shouldDirty: true,
                shouldValidate: true,
              });
            }
          }}
        />
      </PanelFormRow>
    )}
  />
);

const DepreciationFieldRows = ({
  form,
  fields,
}: {
  form: UseFormReturn<TFixedAssetCategoryForm>;
  fields: TDepreciationFields;
}) => {
  const { t } = useTranslation('accounting');

  return (
    <>
      <Form.Field
        control={form.control}
        name={fields.method}
        render={({ field, fieldState }) => (
          <PanelFormRow
            label={t(fields.methodLabel)}
            error={fieldState.error?.message}
          >
            <SettingsPanelSelect
              value={field.value}
              placeholder={t(fields.methodPlaceholder)}
              options={getDepreciationMethodOptions(t)}
              onValueChange={field.onChange}
              className={PANEL_INPUT_CLASS_NAME}
            />
          </PanelFormRow>
        )}
      />
      <NumberFieldRow
        form={form}
        name={fields.usefulLife}
        label={t(fields.usefulLifeLabel)}
        pair={{ name: fields.rate, convert: getRateFromUsefulLife }}
      />
      <NumberFieldRow
        form={form}
        name={fields.rate}
        label={t(fields.rateLabel)}
        pair={{ name: fields.usefulLife, convert: getUsefulLifeFromRate }}
      />
      <NumberFieldRow
        form={form}
        name={fields.salvage}
        label={t(fields.salvageLabel)}
      />
    </>
  );
};

export const FixedAssetCategoryForm = ({
  form,
  onSubmit,
  onCancel,
  saving,
}: {
  form: UseFormReturn<TFixedAssetCategoryForm>;
  onSubmit: (data: TFixedAssetCategoryForm) => void;
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
      saveLabel={t('save-category')}
    >
      <SettingsPanelNameCodeInputs />

      <Form.Field
        control={form.control}
        name="parentId"
        render={({ field }) => (
          <PanelFormRow label={t('parent-category')}>
            <SelectFixedAssetCategory
              selected={field.value}
              onSelect={field.onChange}
              nullable
              variant="ghost"
              hideChevron
              className={SETTINGS_PANEL_CELL_CLASS_NAME}
            />
          </PanelFormRow>
        )}
      />

      {FIXED_ASSET_CATEGORY_DEPRECIATION_FIELDS.map((fields) => (
        <DepreciationFieldRows
          key={fields.method}
          form={form}
          fields={fields}
        />
      ))}

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
