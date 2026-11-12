import { useTranslation } from 'react-i18next';
import { UseFormReturn } from 'react-hook-form';
import { Form } from 'erxes-ui';
import { PANEL_INPUT_CLASS_NAME, PanelFormRow } from 'ui-modules';
import { SelectAccount } from '@/settings/account/components/SelectAccount';
import { JournalEnum } from '@/settings/account/types/Account';
import { SettingsPanelDraftForm } from '@/settings/components/panel/SettingsPanelLayout';
import { FIXED_ASSET_RELATED_ACCOUNT_FIELDS } from '@/settings/fixed-assets/account-config/constants/schema';
import { TFixedAssetAccountConfigForm } from '@/settings/fixed-assets/account-config/types/FixedAssetAccountConfig';

export const FixedAssetAccountConfigForm = ({
  form,
  onSubmit,
  onCancel,
  saving,
}: {
  form: UseFormReturn<TFixedAssetAccountConfigForm>;
  onSubmit: (data: TFixedAssetAccountConfigForm) => void;
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
      saveLabel={t('save')}
    >
      <Form.Field
        control={form.control}
        name="accountId"
        render={({ field, fieldState }) => (
          <PanelFormRow
            label={t('fixed-asset-cost-account')}
            required
            error={fieldState.error?.message}
          >
            <SelectAccount.FormItem
              mode="single"
              value={field.value}
              onValueChange={(accountId) => {
                field.onChange(accountId);
                form.setValue('value.accountId', accountId as string);
              }}
              defaultFilter={{
                journals: [JournalEnum.FIXED_ASSET],
                permissionMode: 'write',
              }}
              placeholder={t('select-asset-account')}
              className={PANEL_INPUT_CLASS_NAME}
            />
          </PanelFormRow>
        )}
      />
      {FIXED_ASSET_RELATED_ACCOUNT_FIELDS.map(([name, label]) => (
        <Form.Field
          key={name}
          control={form.control}
          name={`value.${name}`}
          render={({ field, fieldState }) => (
            <PanelFormRow label={t(label)} error={fieldState.error?.message}>
              <SelectAccount.FormItem
                mode="single"
                value={field.value}
                onValueChange={field.onChange}
                defaultFilter={{ permissionMode: 'write' }}
                placeholder={t('select-accounts')}
                className={PANEL_INPUT_CLASS_NAME}
              />
            </PanelFormRow>
          )}
        />
      ))}
    </SettingsPanelDraftForm>
  );
};
