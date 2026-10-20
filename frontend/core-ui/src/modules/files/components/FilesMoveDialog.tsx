import { IconFolder } from '@tabler/icons-react';
import { Button, Dialog, Spinner } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { FilesBreadcrumb, FilesSpaceTabs } from 'ui-modules';
import { useFilesMoveDialog } from '../hooks/useFilesMoveDialog';

export const FilesMoveDialog = () => {
  const { t } = useTranslation('files');
  const dialog = useFilesMoveDialog();

  return (
    <Dialog open={dialog.open} onOpenChange={(next) => !next && dialog.close()}>
      <Dialog.Content className="max-w-md">
        <Dialog.Header>
          <Dialog.Title>{t('move-item', { name: dialog.label })}</Dialog.Title>
          <Dialog.Description>{t('move-description')}</Dialog.Description>
        </Dialog.Header>

        <FilesSpaceTabs value={dialog.space} onChange={dialog.changeSpace} />
        <FilesBreadcrumb
          space={dialog.space}
          path={dialog.path}
          onOpen={dialog.setBrowseId}
          size="sm"
        />

        <div className="h-64 overflow-y-auto rounded border">
          {dialog.loading && (
            <div className="flex h-full items-center justify-center">
              <Spinner />
            </div>
          )}
          {!dialog.loading && !dialog.folders.length && (
            <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
              {t('no-subfolders')}
            </div>
          )}
          {dialog.folders.map((folder) => (
            <button
              key={folder._id}
              type="button"
              className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-muted"
              onClick={() => dialog.setBrowseId(folder._id)}
            >
              <IconFolder className="size-4 text-muted-foreground" />
              <span className="truncate">{folder.name}</span>
            </button>
          ))}
        </div>

        <Dialog.Footer>
          <Button variant="secondary" onClick={dialog.close}>
            {t('cancel')}
          </Button>
          <Button
            onClick={dialog.confirm}
            disabled={dialog.moving || !dialog.canMoveHere}
          >
            {t('move-here')}
          </Button>
        </Dialog.Footer>
      </Dialog.Content>
    </Dialog>
  );
};
