import { useTranslation } from 'react-i18next';
import { UseFormReturn } from 'react-hook-form';
import { Form, Input } from 'erxes-ui';
import { PANEL_INPUT_CLASS_NAME, PanelFormRow } from 'ui-modules';
import { TAccountCategoryForm } from '@/settings/account/account-categories/types/AccountCategory';
import { SelectAccountCategory } from '@/settings/account/account-categories/components/SelectAccountCategory';
import { SettingsPanelDescriptionInput } from '@/settings/components/panel/SettingsPanelFields';
import { SettingsPanelDraftForm } from '@/settings/components/panel/SettingsPanelLayout';
import { SETTINGS_PANEL_CELL_CLASS_NAME } from '@/settings/constants/settingsPanel';

export const AccountCategoryForm = ({
  form,
  onSubmit,
  onCancel,
  saving,
}: {
  form: UseFormReturn<TAccountCategoryForm>;
  onSubmit: (data: TAccountCategoryForm) => void;
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
      saveLabel={t('save-account-category')}
    >
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
              autoFocus
              autoComplete="off"
              placeholder={t('name')}
              className={PANEL_INPUT_CLASS_NAME}
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
              autoComplete="off"
              placeholder={t('code')}
              className={PANEL_INPUT_CLASS_NAME}
            />
          </PanelFormRow>
        )}
      />

      <Form.Field
        control={form.control}
        name="parentId"
        render={({ field }) => (
          <PanelFormRow label={t('parent')}>
            <SelectAccountCategory
              recordId="side-panel-account-category-new.parent"
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
