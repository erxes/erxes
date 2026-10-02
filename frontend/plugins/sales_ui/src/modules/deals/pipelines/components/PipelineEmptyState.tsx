import { IconGitBranch, IconSettings } from '@tabler/icons-react';
import { Button, Empty } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

interface PipelineEmptyStateProps {
  isSettings?: boolean;
  boardId?: string;
}

export const PipelineEmptyState = ({
  isSettings = false,
  boardId,
}: PipelineEmptyStateProps) => {
  const { t } = useTranslation('sales');
  const settingsSearchParams = new URLSearchParams();
  if (boardId) settingsSearchParams.set('activeBoardId', boardId);

  return (
    <Empty
      className={
        isSettings
          ? 'm-3 border-0 bg-transparent'
          : 'h-full border-0 bg-transparent'
      }
    >
      <Empty.Header>
        <Empty.Media variant="icon">
          <IconGitBranch />
        </Empty.Media>
        <Empty.Title>
          {t('no-pipelines-found', 'No pipelines found')}
        </Empty.Title>
        <Empty.Description>
          {isSettings
            ? t(
                'create-pipeline-with-button',
                'Click Add pipeline above to create a pipeline in this board.',
              )
            : t(
                'create-pipeline-in-settings',
                'Click Go to Settings below, then click Add pipeline to create a pipeline.',
              )}
        </Empty.Description>
      </Empty.Header>
      {!isSettings && (
        <Empty.Content>
          <Button asChild>
            <Link
              to={`/settings/sales/deals?${settingsSearchParams.toString()}`}
            >
              <IconSettings />
              {t('go-to-settings', 'Go to Settings')}
            </Link>
          </Button>
        </Empty.Content>
      )}
    </Empty>
  );
};
