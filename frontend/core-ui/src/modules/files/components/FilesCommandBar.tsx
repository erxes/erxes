import {
  IconFolderSymlink,
  IconPalette,
  IconPin,
  IconShare,
  IconTrash,
} from '@tabler/icons-react';
import { Button, CommandBar, Separator } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { useFilesBulkActions } from '../hooks/useFilesBulkActions';

export const FilesCommandBar = () => {
  const { t } = useTranslation('files');
  const bulk = useFilesBulkActions();

  return (
    <CommandBar open={bulk.open}>
      <CommandBar.Bar>
        <CommandBar.Value onClose={bulk.clear}>
          {t('selected-count', { count: bulk.count })}
        </CommandBar.Value>
        <Separator.Inline />
        {bulk.canManageAll && (
          <>
            <Button variant="secondary" onClick={bulk.move}>
              <IconFolderSymlink />
              {t('move')}
            </Button>
            <Button variant="secondary" onClick={bulk.share}>
              <IconShare />
              {t('share')}
            </Button>
          </>
        )}
        {bulk.canAppearance && (
          <Button variant="secondary" onClick={bulk.appearance}>
            <IconPalette />
            {t('appearance')}
          </Button>
        )}
        <Button
          variant="secondary"
          disabled={!bulk.canPin}
          title={bulk.pinBlockedByLimit ? t('pin-limit') : undefined}
          onClick={bulk.pin}
        >
          <IconPin />
          {t('pin')}
        </Button>
        {bulk.canManageAll && (
          <Button
            variant="secondary"
            className="text-destructive"
            onClick={bulk.trash}
          >
            <IconTrash />
            {t('move-to-trash')}
          </Button>
        )}
      </CommandBar.Bar>
    </CommandBar>
  );
};
