import { useTranslation } from 'react-i18next';
import { FieldErrors, UseFormReturn } from 'react-hook-form';
import { Form, Input, toast } from 'erxes-ui';
import { PANEL_INPUT_CLASS_NAME, PanelFormRow } from 'ui-modules';
import { SettingsPanelDraftForm } from '@/settings/components/panel/SettingsPanelLayout';
import { SettingsPanelDescriptionInput } from '@/settings/components/panel/SettingsPanelFields';
import { SETTINGS_PANEL_CELL_CLASS_NAME } from '@/settings/constants/settingsPanel';
import { SelectFixedAssetCategory } from '@/settings/fixed-assets/components/SelectFixedAssetCategory';
import { TFixedAssetForm } from '@/settings/fixed-assets/types/FixedAsset';

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
  const handleInvalid = (errors: FieldErrors<TFixedAssetForm>) => {
    const fieldLabels: Partial<Record<keyof TFixedAssetForm, string>> = {
      name: t('name'),
      code: t('code'),
      categoryId: t('category-label'),
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
              onSelect={field.onChange}
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
