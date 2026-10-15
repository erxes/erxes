import { IconAffiliate } from '@tabler/icons-react';
import { Button } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { getAutomationSettingsReturnPath } from '@/automations/utils/settingsReturn';

export function AutomationSettingsBreadcrumb() {
  const { t } = useTranslation('automations');
  const navigate = useNavigate();

  return (
    <Button
      variant="ghost"
      onClick={() => navigate(getAutomationSettingsReturnPath())}
    >
      <IconAffiliate />
      {t('automations')}
    </Button>
  );
}
