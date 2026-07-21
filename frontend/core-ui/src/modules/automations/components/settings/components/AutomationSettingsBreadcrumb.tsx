import { IconAffiliate } from '@tabler/icons-react';
import { Button, Separator } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { getAutomationSettingsReturnPath } from '@/automations/utils/settingsReturn';

export function AutomationSettingsBreadcrumb() {
  const { t } = useTranslation('automations');
  const navigate = useNavigate();

  return (
    <>
      <Button
        variant="ghost"
        className="font-semibold"
        onClick={() => navigate(getAutomationSettingsReturnPath())}
      >
        <IconAffiliate className="w-4 h-4 text-accent-foreground" />
        {t('automations', 'Automations')}
      </Button>
      <Separator.Inline />
    </>
  );
}
