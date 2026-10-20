import {
  IconDotsVertical,
  IconDownload,
  IconFolderSymlink,
  IconPalette,
  IconPencil,
  IconPin,
  IconPinnedOff,
  IconShare,
  IconTrash,
} from '@tabler/icons-react';
import { Button, DropdownMenu } from 'erxes-ui';
import { useTranslation } from 'react-i18next';

type TFilesRowMenuProps = {
  pinned: boolean;
  pinDisabled?: boolean;
  canManage: boolean;
  onAccess?: () => void;
  onTogglePin: () => void;
  onAppearance?: () => void;
  onRename: () => void;
  onMove: () => void;
  onTrash: () => void;
  onDownload?: () => void;
};

export const FilesRowMenu = ({
  pinned,
  pinDisabled,
  canManage,
  onAccess,
  onTogglePin,
  onAppearance,
  onRename,
  onMove,
  onTrash,
  onDownload,
}: TFilesRowMenuProps) => {
  const { t } = useTranslation('files');

  return (
    <DropdownMenu>
      <DropdownMenu.Trigger asChild>
        <Button
          variant="ghost"
          size="icon"
          aria-label={t('more-actions')}
          onClick={(e) => e.stopPropagation()}
        >
          <IconDotsVertical />
        </Button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Content align="end" onClick={(e) => e.stopPropagation()}>
        <DropdownMenu.Item
          disabled={!pinned && pinDisabled}
          title={!pinned && pinDisabled ? t('pin-limit') : undefined}
          onSelect={onTogglePin}
        >
          {pinned ? <IconPinnedOff /> : <IconPin />}
          {pinned ? t('unpin') : t('pin')}
        </DropdownMenu.Item>
        {onDownload && (
          <DropdownMenu.Item onSelect={onDownload}>
            <IconDownload />
            {t('download')}
          </DropdownMenu.Item>
        )}
        {canManage && onAccess && (
          <DropdownMenu.Item onSelect={onAccess}>
            <IconShare />
            {t('share-access')}
          </DropdownMenu.Item>
        )}
        {canManage && (
          <>
            {onAppearance && (
              <DropdownMenu.Item onSelect={onAppearance}>
                <IconPalette />
                {t('appearance')}
              </DropdownMenu.Item>
            )}
            <DropdownMenu.Item onSelect={onRename}>
              <IconPencil />
              {t('rename')}
            </DropdownMenu.Item>
            <DropdownMenu.Item onSelect={onMove}>
              <IconFolderSymlink />
              {t('move')}
            </DropdownMenu.Item>
            <DropdownMenu.Item className="text-destructive" onSelect={onTrash}>
              <IconTrash />
              {t('move-to-trash')}
            </DropdownMenu.Item>
          </>
        )}
      </DropdownMenu.Content>
    </DropdownMenu>
  );
};
