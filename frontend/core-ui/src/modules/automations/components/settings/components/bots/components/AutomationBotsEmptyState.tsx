import { IconRobot } from '@tabler/icons-react';
import { Empty } from 'erxes-ui';
import { useTranslation } from 'react-i18next';

export const AutomationBotsEmptyState = () => {
  const { t } = useTranslation('automations');
  return (
    <Empty className="my-8">
      <Empty.Header>
        <Empty.Media variant="icon">
          <IconRobot />
        </Empty.Media>
        <Empty.Title>{t('settings-bots-empty-title')}</Empty.Title>
        <Empty.Description>
          {t('settings-bots-empty-description')}
        </Empty.Description>
      </Empty.Header>
    </Empty>
  );
};
