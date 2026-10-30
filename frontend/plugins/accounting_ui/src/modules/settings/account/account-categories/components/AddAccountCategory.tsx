import { useTranslation } from 'react-i18next';
import { SettingsPanelAddButton } from '@/settings/components/panel/SettingsPanelActions';
import { ACCOUNT_CATEGORY_CONTENT_TYPE } from '@/settings/constants/settingsPanel';

export const AddAccountCategory = () => {
  const { t } = useTranslation('accounting');

  return (
    <SettingsPanelAddButton
      contentType={ACCOUNT_CATEGORY_CONTENT_TYPE}
      label={t('add-account-category')}
    />
  );
};
