import { useMutation } from '@apollo/client';
import { REACT_APP_API_URL, useToast } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { TImportProgress } from 'ui-modules';
import {
  IMPORT_CANCEL,
  IMPORT_RESUME,
  IMPORT_RETRY,
} from '../graphql/importMutations';
import { GET_IMPORT_HISTORIES } from '../graphql/importQueries';

export const useImportHistoryActionsCell = ({
  importItem,
}: {
  importItem: TImportProgress;
}) => {
  const { _id, status, fileKey, errorFileUrl } = importItem;
  const { t } = useTranslation('importExport');
  const { toast } = useToast();

  const canCancel =
    status === 'pending' || status === 'validating' || status === 'processing';
  const canRetry = status === 'failed';
  // the worker resumes from lastProcessedRow, so a failed job need not restart
  const canResume = status === 'cancelled' || status === 'failed';
  const canOpenErrorFile = !!errorFileUrl;
  const canDownloadOriginal = !!fileKey;
  const isSuccess = status === 'completed';

  const canShowMenu =
    canOpenErrorFile ||
    canDownloadOriginal ||
    canCancel ||
    canRetry ||
    canResume ||
    isSuccess;

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
  const isBusy =
    cancelImportState.loading ||
    retryImportState.loading ||
    resumeImportState.loading;

  function handleDownloadErrorFile() {
    if (!errorFileUrl) {
      return;
    }

    // errorFileUrl is a storage key, not a browsable URL
    const fileUrl = `${REACT_APP_API_URL}/read-file?key=${encodeURIComponent(
      errorFileUrl,
    )}`;

    const a = document.createElement('a');
    a.href = fileUrl;
    a.download = `import-errors-${_id}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  }

  function handleDownloadOriginal() {
    if (!fileKey) {
      return;
    }

    const fileUrl = `${REACT_APP_API_URL}/read-file?key=${encodeURIComponent(
      fileKey,
    )}`;
    window.open(fileUrl, '_blank');
  }

  async function runAction(
    action: () => Promise<unknown>,
    messages: { success: string; description: string; failed: string },
  ) {
    try {
      await action();
      toast({
        title: t(messages.success),
        description: t(messages.description),
      });
    } catch (error) {
      toast({
        title: t(messages.failed),
        description:
          error instanceof Error ? error.message : t(messages.failed),
        variant: 'destructive',
      });
    }
  }

  function handleCancel() {
    return runAction(() => cancelImport({ variables: { importId: _id } }), {
      success: 'import-cancelled',
      description: 'import-cancelled-description',
      failed: 'import-cancel-failed',
    });
  }

  function handleRetry() {
    return runAction(() => retryImport({ variables: { importId: _id } }), {
      success: 'import-restarted',
      description: 'import-restarted-description',
      failed: 'import-restart-failed',
    });
  }

  function handleResume() {
    return runAction(() => resumeImport({ variables: { importId: _id } }), {
      success: 'import-resumed',
      description: 'import-resumed-description',
      failed: 'import-resume-failed',
    });
  }

  return {
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
  };
};
