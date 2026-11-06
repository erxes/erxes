import { useTranslation } from 'react-i18next';
import { SettingsPanelAddButton } from '@/settings/components/panel/SettingsPanelActions';
import { ACCOUNT_CONTENT_TYPE } from '@/settings/constants/settingsPanel';

export const AddAccount = () => {
  const { t } = useTranslation('accounting');

  return (
    <SettingsPanelAddButton
      contentType={ACCOUNT_CONTENT_TYPE}
      label={t('add-account')}
    />
  );
};
