import { useMutation } from '@apollo/client';
import { REACT_APP_API_URL } from 'erxes-ui';
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

  const canCancel =
    status === 'pending' || status === 'validating' || status === 'processing';
  const canRetry = status === 'failed';
  const canResume = status === 'cancelled';
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

  function handleOpenErrorFile() {
    if (!errorFileUrl) {
      return;
    }

    window.open(errorFileUrl, '_blank');
  }

  function handleDownloadErrorFile() {
    if (!errorFileUrl) {
      return;
    }

    const a = document.createElement('a');
    a.href = errorFileUrl;
    a.target = '_blank';
    a.rel = 'noreferrer';
    a.download = '';
    document.body.appendChild(a);
    a.click();
    a.remove();
  }

  function handleDownloadOriginal() {
    if (!fileKey) {
      return;
    }

    const fileUrl = `${REACT_APP_API_URL}/read-file?key=${encodeURIComponent(fileKey)}`;
    window.open(fileUrl, '_blank');
  }

  async function handleCancel() {
    await cancelImport({
      variables: { importId: _id },
    });
  }

  async function handleRetry() {
    await retryImport({
      variables: { importId: _id },
    });
  }

  async function handleResume() {
    await resumeImport({
      variables: { importId: _id },
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
    handleOpenErrorFile,
    handleDownloadErrorFile,
    handleDownloadOriginal,
    handleCancel,
    handleRetry,
    handleResume,
  };
};
