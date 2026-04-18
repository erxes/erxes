import {
  IconDots,
  IconDownload,
  IconPlayerPlay,
  IconRefresh,
  IconX,
} from '@tabler/icons-react';
import { DropdownMenu, RecordTableInlineCell } from 'erxes-ui';
import { Can, TImportProgress } from 'ui-modules';
import { useImportHistoryActionsCell } from '../hooks/useImportHistoryActionsCell';

export function ImportHistoryActionsCell({
  importItem,
}: {
  importItem: TImportProgress;
}) {
  const {
    canShowMenu,
    canOpenErrorFile,
    canDownloadOriginal,
    canCancel,
    canRetry,
    canResume,
    isBusy,
    handleDownloadErrorFile,
    handleDownloadOriginal,
    handleCancel,
    handleRetry,
    handleResume,
  } = useImportHistoryActionsCell({ importItem });

  if (!canShowMenu) {
    return (
      <RecordTableInlineCell className="justify-end text-xs text-muted-foreground" />
    );
  }

  const hasManageActions = canCancel || canRetry || canResume;
  const hasFileActions = canOpenErrorFile || canDownloadOriginal;

  return (
    <DropdownMenu>
      <DropdownMenu.Trigger asChild>
        <RecordTableInlineCell className="justify-center cursor-pointer">
          <IconDots className="size-4 text-muted-foreground" />
        </RecordTableInlineCell>
      </DropdownMenu.Trigger>
      <DropdownMenu.Content>
        {canDownloadOriginal && (
          <DropdownMenu.Item onClick={handleDownloadOriginal}>
            <IconDownload /> Download imported file
          </DropdownMenu.Item>
        )}

        <Can actions={['exportsManage', 'manageExports']} fallback={null}>
          {canOpenErrorFile && (
            <DropdownMenu.Item onClick={handleDownloadErrorFile}>
              <IconDownload /> Download error file
            </DropdownMenu.Item>
          )}
        </Can>

        {hasManageActions && hasFileActions && <DropdownMenu.Separator />}

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
