import { IconLayoutKanban, IconSettings } from '@tabler/icons-react';
import { Button, Empty } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

interface BoardEmptyStateProps {
  isSettings?: boolean;
  hasBoards?: boolean;
}

export const BoardEmptyState = ({
  isSettings = false,
  hasBoards = false,
}: BoardEmptyStateProps) => {
  const { t } = useTranslation('sales');

  const settingsDescription = hasBoards
    ? t(
        'select-board-for-pipelines',
        'Click + next to Boards to create a board, or select an existing board.',
      )
    : t(
        'create-board-with-plus',
        'Click the + button next to Boards to create a board.',
      );
  const dealsDescription = hasBoards
    ? t('choose-board')
    : t(
        'create-board-in-settings',
        'Click Go to Settings below, then click + next to Boards to create a board.',
      );

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
          <IconLayoutKanban />
        </Empty.Media>
        <Empty.Title>
          {hasBoards
            ? t('select-board', 'Select a board')
            : t('no-boards-found', 'No boards found')}
        </Empty.Title>
        <Empty.Description>
          {isSettings ? settingsDescription : dealsDescription}
        </Empty.Description>
      </Empty.Header>
      {!isSettings && (
        <Empty.Content>
          <Button asChild>
            <Link to="/settings/sales/deals">
              <IconSettings />
              {t('go-to-settings', 'Go to Settings')}
            </Link>
          </Button>
        </Empty.Content>
      )}
    </Empty>
  );
};
