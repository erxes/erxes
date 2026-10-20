import { IconFolders, IconUser, IconUsersGroup } from '@tabler/icons-react';
import { Button } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { TFilesSpace } from '../types';

const SPACES: { space: TFilesSpace; label: string; Icon: typeof IconUser }[] = [
  { space: 'personal', label: 'my-files', Icon: IconUser },
  { space: 'org', label: 'org-drive', Icon: IconFolders },
  { space: 'shared', label: 'shared-with-me', Icon: IconUsersGroup },
];

export const FilesSpaceTabs = ({
  value,
  onChange,
}: {
  value: TFilesSpace;
  onChange: (space: TFilesSpace) => void;
}) => {
  const { t } = useTranslation('files');

  return (
    <div className="flex gap-1">
      {SPACES.map(({ space, label, Icon }) => (
        <Button
          key={space}
          size="sm"
          variant={value === space ? 'secondary' : 'ghost'}
          onClick={() => onChange(space)}
        >
          <Icon />
          {t(label)}
        </Button>
      ))}
    </div>
  );
};
