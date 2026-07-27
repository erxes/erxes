import {
  IconDots,
  IconDownload,
  IconPlayerPlay,
  IconRefresh,
  IconX,
} from '@tabler/icons-react';
import { DropdownMenu, RecordTableInlineCell } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { Can, TImportProgress } from 'ui-modules';
import { useImportHistoryActionsCell } from '../hooks/useImportHistoryActionsCell';

export function ImportHistoryActionsCell({
  importItem,
}: {
  importItem: TImportProgress;
}) {
  const { t } = useTranslation('import-export');
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
            <IconDownload /> {t('download-imported-file', 'Download imported file')}
          </DropdownMenu.Item>
        )}

        <Can actions={['exportsManage', 'manageExports']} fallback={null}>
          {canOpenErrorFile && (
            <DropdownMenu.Item onClick={handleDownloadErrorFile}>
              <IconDownload /> {t('download-error-file', 'Download error file')}
            </DropdownMenu.Item>
          )}
        </Can>

        {hasManageActions && hasFileActions && <DropdownMenu.Separator />}

        <Can actions={['importsManage', 'manageImports']} fallback={null}>
          {canCancel && (
            <DropdownMenu.Item disabled={isBusy} onClick={handleCancel}>
              <IconX /> {t('cancel-import', 'Cancel import')}
            </DropdownMenu.Item>
          )}

          {canRetry && (
            <DropdownMenu.Item disabled={isBusy} onClick={handleRetry}>
              <IconRefresh /> {t('restart-import', 'Restart import')}
            </DropdownMenu.Item>
          )}

          {canResume && (
            <DropdownMenu.Item disabled={isBusy} onClick={handleResume}>
              <IconPlayerPlay /> {t('resume-import', 'Resume import')}
            </DropdownMenu.Item>
          )}
        </Can>
      </DropdownMenu.Content>
    </DropdownMenu>
  );
}
