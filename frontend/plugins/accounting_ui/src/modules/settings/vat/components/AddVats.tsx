import { useTranslation } from 'react-i18next';
import { SettingsPanelAddButton } from '@/settings/components/panel/SettingsPanelActions';
import { VAT_ROW_CONTENT_TYPE } from '@/settings/constants/settingsPanel';

export const AddVats = () => {
  const { t } = useTranslation('accounting');

  return (
    <SettingsPanelAddButton
      contentType={VAT_ROW_CONTENT_TYPE}
      label={t('add-vat')}
    />
  );
};
