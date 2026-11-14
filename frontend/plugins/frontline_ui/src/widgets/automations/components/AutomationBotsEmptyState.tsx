import { IconRobotFace } from '@tabler/icons-react';
import { Empty } from 'erxes-ui';
import { useTranslation } from 'react-i18next';

export const AutomationBotsEmptyState = ({
  platform,
}: Readonly<{ platform: 'facebook' | 'instagram' }>) => {
  const { t } = useTranslation('frontline', {
    keyPrefix: `modules.${platform}`,
  });
  return (
    <Empty className="min-h-72 flex-none border bg-muted/10">
      <Empty.Header>
        <Empty.Media variant="icon">
          <IconRobotFace />
        </Empty.Media>
        <Empty.Title>{t('no-bots-yet', 'No bots yet')}</Empty.Title>
        <Empty.Description>
          {t(
            'bots-empty-description',
            'Use Add Bot to connect a page and start automating replies.',
          )}
        </Empty.Description>
      </Empty.Header>
    </Empty>
  );
};
