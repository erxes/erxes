import { useMemo, useCallback } from 'react';
import {
  IconClockQuestion,
  IconFileCheck,
  IconLoader,
  IconCheck,
  IconAlertCircle,
  IconX,
} from '@tabler/icons-react';
import { useImport } from './useImport';
import { useToast } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { TImportProgress } from '../../types/import/importTypes';

function formatTime(seconds: number): string {
  if (seconds < 60) {
    return `${seconds}s`;
  }
  if (seconds < 3600) {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}m ${secs}s`;
  }
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  return `${hours}h ${minutes}m`;
}

const statusMap = {
  pending: { key: 'pending', icon: IconClockQuestion },
  validating: { key: 'validating', icon: IconFileCheck },
  processing: { key: 'processing', icon: IconLoader },
  completed: { key: 'completed', icon: IconCheck },
  failed: { key: 'failed', icon: IconAlertCircle },
  cancelled: { key: 'cancelled', icon: IconX },
};

export function useImportProgress(importProgress: TImportProgress) {
  const { t } = useTranslation('importExport');

  const timeRemaining = useMemo(
    () => formatTime(importProgress.estimatedSecondsRemaining || 0),
    [importProgress.estimatedSecondsRemaining],
  );

  const statusObject = useMemo(() => {
    const status = statusMap[importProgress.status as keyof typeof statusMap];
    return {
      label: t(status ? `status-${status.key}` : 'status-unknown'),
      Icon: status?.icon,
      status: status?.key,
    };
  }, [importProgress.status, t]);

  const { cancelImport, retryImport, resumeImport } = useImport();
  const { toast } = useToast();

  const handleCancel = useCallback(async () => {
    try {
      await cancelImport(importProgress._id);
      toast({
        title: t('import-cancelled'),
        description: t('import-cancelled-description'),
      });
    } catch (error: any) {
      toast({
        title: t('import-cancel-failed'),
        description: error?.message || t('import-cancel-failed'),
        variant: 'destructive',
      });
    }
  }, [importProgress._id, cancelImport, toast, t]);

  const handleRetry = useCallback(async () => {
    try {
      await retryImport(importProgress._id);
      toast({
        title: t('import-restarted'),
        description: t('import-restarted-description'),
      });
    } catch (error: any) {
      toast({
        title: t('import-restart-failed'),
        description: error?.message || t('import-restart-failed'),
        variant: 'destructive',
      });
    }
  }, [importProgress._id, retryImport, toast, t]);

  const handleResume = useCallback(async () => {
    try {
      await resumeImport(importProgress._id);
      toast({
        title: t('import-resumed'),
        description: t('import-resumed-description'),
      });
    } catch (error: any) {
      toast({
        title: t('import-resume-failed'),
        description: error?.message || t('import-resume-failed'),
        variant: 'destructive',
      });
    }
  }, [importProgress._id, resumeImport, toast, t]);

  const canCancel = useMemo(
    () =>
      ['pending', 'validating', 'processing'].includes(importProgress.status),
    [importProgress.status],
  );

  const canRetry = useMemo(
    () => importProgress.status === 'failed',
    [importProgress.status],
  );

  // the worker resumes from lastProcessedRow, so a failed job need not restart
  const canResume = useMemo(
    () =>
      importProgress.status === 'cancelled' ||
      importProgress.status === 'failed',
    [importProgress.status],
  );

  return {
    timeRemaining,
    statusObject,
    handleCancel,
    handleRetry,
    handleResume,
    canCancel,
    canRetry,
    canResume,
  };
}
