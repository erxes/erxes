import {
  IconChevronRight,
  IconFolders,
  IconUsersGroup,
} from '@tabler/icons-react';
import { Button } from 'erxes-ui';
import { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { IFilesFolder, TFilesSpace } from '../types';

type TFilesBreadcrumbProps = {
  space: TFilesSpace;
  path: IFilesFolder[];
  onOpen: (folderId?: string) => void;
  size?: 'sm' | 'default';
  wrapItem?: (folder: IFilesFolder, crumb: ReactNode) => ReactNode;
};

export const FilesBreadcrumb = ({
  space,
  path,
  onOpen,
  size = 'default',
  wrapItem = (_folder, crumb) => crumb,
}: TFilesBreadcrumbProps) => {
  const { t } = useTranslation('files');

  const labelOf = (folder: IFilesFolder) =>
    folder.space === 'personal'
      ? t('my-files')
      : folder.space === 'org'
      ? t('org-drive')
      : folder.name;

  return (
    <div className="flex min-w-0 flex-wrap items-center gap-1 text-sm">
      {space === 'shared' && (
        <Button variant="ghost" size={size} onClick={() => onOpen()}>
          <IconUsersGroup />
          {t('shared-with-me')}
        </Button>
      )}
      {path.map((folder, index) => (
        <span key={folder._id} className="flex items-center gap-1">
          {(index > 0 || space === 'shared') && (
            <IconChevronRight className="size-3 text-muted-foreground" />
          )}
          {wrapItem(
            folder,
            <Button
              variant="ghost"
              size={size}
              onClick={() => onOpen(folder._id)}
            >
              {index === 0 && space !== 'shared' && <IconFolders />}
              {labelOf(folder)}
            </Button>,
          )}
        </span>
      ))}
    </div>
  );
};
