import { useTranslation } from 'react-i18next';
import { SettingsPanelAddButton } from '@/settings/components/panel/SettingsPanelActions';
import { CTAX_ROW_CONTENT_TYPE } from '@/settings/constants/settingsPanel';

export const AddCtaxs = () => {
  const { t } = useTranslation('accounting');

  return (
    <SettingsPanelAddButton
      contentType={CTAX_ROW_CONTENT_TYPE}
      label={t('add-city-tax')}
    />
  );
};
