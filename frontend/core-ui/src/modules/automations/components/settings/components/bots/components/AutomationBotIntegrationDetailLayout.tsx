import { AutomationSettingsPath } from '@/types/paths/AutomationPath';
import { IconChevronLeft } from '@tabler/icons-react';
import { Button } from 'erxes-ui';
import { Link } from 'react-router';
import { useTranslation } from 'react-i18next';

export const AutomationBotIntegrationDetailLayout = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { t } = useTranslation('automations');
  return (
    <div className="mx-auto p-5 w-full max-w-5xl flex flex-col gap-8">
      <div>
        <Button variant="ghost" asChild>
          <Link to={AutomationSettingsPath.Bots}>
            <IconChevronLeft />
            {t('bots', 'Bots')}
          </Link>
        </Button>
      </div>
      <div className="px-8">{children}</div>
    </div>
  );
};
