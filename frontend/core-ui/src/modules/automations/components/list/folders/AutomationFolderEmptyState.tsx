import { IconFolderOpen } from '@tabler/icons-react';
import { Empty } from 'erxes-ui';
import { useTranslation } from 'react-i18next';

/** An empty folder, or a top level where every automation is in a folder. */
export const AutomationFolderEmptyState = ({
  inFolder,
}: {
  inFolder: boolean;
}) => {
  const { t } = useTranslation('automations');

  return (
    <Empty className="m-3 min-h-[12rem] bg-accent/30">
      <Empty.Header>
        <Empty.Media variant="icon">
          <IconFolderOpen />
        </Empty.Media>
        <Empty.Title>
          {inFolder ? t('folder-empty-title') : t('folders-all-filed-title')}
        </Empty.Title>
        <Empty.Description>
          {inFolder
            ? t('folder-empty-description')
            : t('folders-all-filed-description')}
        </Empty.Description>
      </Empty.Header>
    </Empty>
  );
};
