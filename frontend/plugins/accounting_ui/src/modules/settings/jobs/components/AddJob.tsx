import { useTranslation } from 'react-i18next';
import { SettingsPanelAddButton } from '@/settings/components/panel/SettingsPanelActions';
import { JOB_CONTENT_TYPE } from '@/settings/constants/settingsPanel';

export const AddJob = () => {
  const { t } = useTranslation('accounting');

  return (
    <SettingsPanelAddButton
      contentType={JOB_CONTENT_TYPE}
      label={t('job-add')}
    />
  );
};
