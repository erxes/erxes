import { useTranslation } from 'react-i18next';
import { SettingsPanelAddButton } from '@/settings/components/panel/SettingsPanelActions';
import { FIXED_ASSET_CATEGORY_CONTENT_TYPE } from '@/settings/constants/settingsPanel';

export const AddFixedAssetCategory = () => {
  const { t } = useTranslation('accounting');

  return (
    <SettingsPanelAddButton
      contentType={FIXED_ASSET_CATEGORY_CONTENT_TYPE}
      label={t('add-category')}
    />
  );
};
