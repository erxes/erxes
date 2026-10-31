import { useTranslation } from 'react-i18next';
import { ACCOUNTING_SETTINGS_CODES } from '@/settings/constants/settingsRoutes';
import { getSyncConfigContentType } from '@/settings/constants/settingsPanel';
import { SettingsPanelAddButton } from '@/settings/components/panel/SettingsPanelActions';

export const AddAccountingConfig = ({
  code,
}: {
  code: ACCOUNTING_SETTINGS_CODES;
}) => {
  const { t } = useTranslation('accounting');

  return (
    <SettingsPanelAddButton
      contentType={getSyncConfigContentType(code)}
      label={t('add-configuration')}
    />
  );
};
