import {
  IconDots,
  IconDownload,
  IconFileText,
  IconPlayerPlay,
  IconRefresh,
  IconX,
} from '@tabler/icons-react';
import { useMutation } from '@apollo/client';
import { DropdownMenu, RecordTableInlineCell } from 'erxes-ui';
import { Can, TImportProgress } from 'ui-modules';
import {
  IMPORT_CANCEL,
  IMPORT_RESUME,
  IMPORT_RETRY,
} from '../graphql/importMutations';
import { GET_IMPORT_HISTORIES } from '../graphql/importQueries';

export function ImportHistoryActionsCell({
  importItem,
}: {
  importItem: TImportProgress;
}) {
  const canCancel =
    importItem.status === 'pending' ||
    importItem.status === 'validating' ||
    importItem.status === 'processing';
  const canRetry = importItem.status === 'failed';
  const canResume = importItem.status === 'cancelled';
  const canOpenErrorFile = !!importItem.errorFileUrl;

  const canShowMenu = canOpenErrorFile || canCancel || canRetry || canResume;

  const [cancelImport, cancelImportState] = useMutation(IMPORT_CANCEL, {
    refetchQueries: [GET_IMPORT_HISTORIES],
    awaitRefetchQueries: true,
  });
  const [retryImport, retryImportState] = useMutation(IMPORT_RETRY, {
    refetchQueries: [GET_IMPORT_HISTORIES],
    awaitRefetchQueries: true,
  });
  const [resumeImport, resumeImportState] = useMutation(IMPORT_RESUME, {
    refetchQueries: [GET_IMPORT_HISTORIES],
    awaitRefetchQueries: true,
  });

  if (!canShowMenu) {
    return (
      <RecordTableInlineCell className="justify-end text-xs text-muted-foreground" />
    );
  }

  const isBusy =
    cancelImportState.loading ||
    retryImportState.loading ||
    resumeImportState.loading;

  function handleOpenErrorFile() {
    if (!importItem.errorFileUrl) {
      return;
    }

    window.open(importItem.errorFileUrl, '_blank');
  }

  function handleDownloadErrorFile() {
    if (!importItem.errorFileUrl) {
      return;
    }

    const a = document.createElement('a');
    a.href = importItem.errorFileUrl;
    a.target = '_blank';
    a.rel = 'noreferrer';
    a.download = '';
    document.body.appendChild(a);
    a.click();
    a.remove();
  }

  async function handleCancel() {
    await cancelImport({
      variables: { importId: importItem._id },
    });
  }

  async function handleRetry() {
    await retryImport({
      variables: { importId: importItem._id },
    });
  }

  async function handleResume() {
    await resumeImport({
      variables: { importId: importItem._id },
    });
  }

  return (
    <DropdownMenu>
      <DropdownMenu.Trigger asChild>
        <RecordTableInlineCell className="justify-center cursor-pointer">
          <IconDots className="size-4 text-muted-foreground" />
        </RecordTableInlineCell>
      </DropdownMenu.Trigger>
      <DropdownMenu.Content>
        <Can actions={['exportsManage', 'manageExports']} fallback={null}>
          {canOpenErrorFile && (
            <>
              <DropdownMenu.Item onClick={handleOpenErrorFile}>
                <IconFileText /> Open error file
              </DropdownMenu.Item>
              <DropdownMenu.Item onClick={handleDownloadErrorFile}>
                <IconDownload /> Download error file
              </DropdownMenu.Item>
            </>
          )}
        </Can>

        {(canCancel || canRetry || canResume) && canOpenErrorFile && (
          <DropdownMenu.Separator />
        )}

        <Can actions={['importsManage', 'manageImports']} fallback={null}>
          {canCancel && (
            <DropdownMenu.Item disabled={isBusy} onClick={handleCancel}>
              <IconX /> Cancel import
            </DropdownMenu.Item>
          )}

          {canRetry && (
            <DropdownMenu.Item disabled={isBusy} onClick={handleRetry}>
              <IconRefresh /> Restart import
            </DropdownMenu.Item>
          )}

          {canResume && (
            <DropdownMenu.Item disabled={isBusy} onClick={handleResume}>
              <IconPlayerPlay /> Resume import
            </DropdownMenu.Item>
          )}
        </Can>
      </DropdownMenu.Content>
    </DropdownMenu>
  );
}
