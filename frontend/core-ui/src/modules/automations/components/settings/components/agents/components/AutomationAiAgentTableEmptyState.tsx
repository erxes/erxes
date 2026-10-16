import { IconPlus, IconRobot } from '@tabler/icons-react';
import { Button, Empty } from 'erxes-ui';
import { Link } from 'react-router';
import { Can } from 'ui-modules';
import { useTranslation } from 'react-i18next';

export const AutomationAiAgentTableEmptyState = ({
  toCreateUrl,
}: {
  toCreateUrl: string;
}) => {
  const { t } = useTranslation('automations');
  return (
    <Empty className="my-8">
      <Empty.Header>
        <Empty.Media variant="icon">
          <IconRobot />
        </Empty.Media>
        <Empty.Title>{t('settings-agents-empty-title')}</Empty.Title>
        <Empty.Description>
          {t('settings-agents-empty-description')}
        </Empty.Description>
      </Empty.Header>
      <Can action="automationsAiAgentAdd">
        <Empty.Content>
          <Button asChild>
            <Link to={toCreateUrl}>
              <IconPlus className="size-4" />
              {t('settings-agents-create-first')}
            </Link>
          </Button>
        </Empty.Content>
      </Can>
    </Empty>
  );
};
