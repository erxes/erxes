import {
  IconFolder,
  IconRestore,
  IconTrash,
  IconTrashX,
} from '@tabler/icons-react';
import { Button, Empty, formatBytes, Spinner, Table } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { FileTypeIcon, PageHeader } from 'ui-modules';
import { useFilesTrash } from '../hooks/useFilesTrash';

const formatDate = (value?: string | null) =>
  value ? new Date(value).toLocaleString() : '';

export const FilesTrashList = () => {
  const { t } = useTranslation('files');
  const trash = useFilesTrash();

  return (
    <>
      <PageHeader>
        <PageHeader.Start>
          <span className="flex items-center gap-2 px-2 text-sm font-medium">
            <IconTrash className="size-4" />
            {t('trash')}
          </span>
        </PageHeader.Start>
        <PageHeader.End>
          <span className="text-xs text-muted-foreground">
            {t('trash-retention')}
          </span>
          <Button
            variant="secondary"
            className="text-destructive"
            disabled={trash.isEmpty || trash.acting}
            onClick={trash.emptyTrash}
          >
            <IconTrashX />
            {t('empty-trash')}
          </Button>
        </PageHeader.End>
      </PageHeader>

      <div className="flex-1 overflow-auto">
        {trash.loading && !trash.files.length && !trash.folders.length && (
          <div className="flex h-full items-center justify-center">
            <Spinner />
          </div>
        )}

        {trash.error && (
          <div className="p-4 text-sm text-destructive">
            {trash.error.message}
          </div>
        )}

        {trash.isEmpty && (
          <Empty className="h-full">
            <Empty.Header>
              <Empty.Media variant="icon">
                <IconTrash />
              </Empty.Media>
              <Empty.Title>{t('trash-empty-title')}</Empty.Title>
              <Empty.Description>
                {t('trash-empty-description')}
              </Empty.Description>
            </Empty.Header>
          </Empty>
        )}

        {!trash.isEmpty && !trash.loading && (
          <Table>
            <Table.Header>
              <Table.Row>
                <Table.Head>{t('name')}</Table.Head>
                <Table.Head className="w-28">{t('size')}</Table.Head>
                <Table.Head className="w-48">{t('deleted-at')}</Table.Head>
                <Table.Head className="w-48" />
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {trash.folders.map((folder) => (
                <Table.Row key={folder._id}>
                  <Table.Cell>
                    <span className="flex items-center gap-2">
                      <IconFolder className="size-4 text-muted-foreground" />
                      {folder.name}
                    </span>
                  </Table.Cell>
                  <Table.Cell className="text-muted-foreground">—</Table.Cell>
                  <Table.Cell className="text-muted-foreground">
                    {formatDate(folder.deletedAt)}
                  </Table.Cell>
                  <Table.Cell>
                    <TrashActions
                      disabled={trash.acting}
                      onRestore={() => trash.restoreFolder(folder._id)}
                      onPurge={() => trash.purgeFolder(folder._id)}
                    />
                  </Table.Cell>
                </Table.Row>
              ))}
              {trash.files.map((file) => (
                <Table.Row key={file._id}>
                  <Table.Cell>
                    <span className="flex items-center gap-2">
                      <FileTypeIcon
                        mimeType={file.mimeType}
                        className="size-4 text-muted-foreground"
                      />
                      <span className="truncate">{file.name}</span>
                    </span>
                  </Table.Cell>
                  <Table.Cell className="text-muted-foreground">
                    {formatBytes(file.size, 1)}
                  </Table.Cell>
                  <Table.Cell className="text-muted-foreground">
                    {formatDate(file.deletedAt)}
                  </Table.Cell>
                  <Table.Cell>
                    <TrashActions
                      disabled={trash.acting}
                      onRestore={() => trash.restoreFile(file._id)}
                      onPurge={() => trash.purgeFile(file._id)}
                    />
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table>
        )}
      </div>
    </>
  );
};

const TrashActions = ({
  disabled,
  onRestore,
  onPurge,
}: {
  disabled: boolean;
  onRestore: () => void;
  onPurge: () => void;
}) => {
  const { t } = useTranslation('files');

  return (
    <span className="flex justify-end gap-1">
      <Button variant="ghost" size="sm" disabled={disabled} onClick={onRestore}>
        <IconRestore />
        {t('restore')}
      </Button>
      <Button
        variant="ghost"
        size="sm"
        className="text-destructive"
        disabled={disabled}
        onClick={onPurge}
      >
        <IconTrashX />
        {t('delete-forever')}
      </Button>
    </span>
  );
};
