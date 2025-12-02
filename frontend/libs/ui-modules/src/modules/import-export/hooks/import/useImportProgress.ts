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
  pending: { key: 'pending', label: 'Pending', icon: IconClockQuestion },
  validating: { key: 'validating', label: 'Validating', icon: IconFileCheck },
  processing: { key: 'processing', label: 'Processing', icon: IconLoader },
  completed: { key: 'completed', label: 'Completed', icon: IconCheck },
  failed: { key: 'failed', label: 'Failed', icon: IconAlertCircle },
  cancelled: { key: 'cancelled', label: 'Cancelled', icon: IconX },
};

export function useImportProgress(importProgress: TImportProgress) {
  const timeRemaining = useMemo(
    () => formatTime(importProgress.estimatedSecondsRemaining || 0),
    [importProgress.estimatedSecondsRemaining],
  );

  const statusObject = useMemo(() => {
    const status = statusMap[importProgress.status as keyof typeof statusMap];
    return {
      label: status?.label || 'Unknown',
      Icon: status?.icon,
      status: status?.key,
    };
  }, [importProgress.status]);

  const { cancelImport, retryImport, resumeImport } = useImport();
  const { toast } = useToast();

  const handleCancel = useCallback(async () => {
    try {
      await cancelImport(importProgress._id);
      toast({
        title: 'Import cancelled',
        description: 'The import process has been cancelled',
      });
    } catch (error: any) {
      toast({
        title: 'Failed to cancel import',
        description:
          error?.message || 'An error occurred while cancelling the import',
        variant: 'destructive',
      });
    }
  }, [importProgress._id, cancelImport, toast]);

  const handleRetry = useCallback(async () => {
    try {
      await retryImport(importProgress._id);
      toast({
        title: 'Import retried',
        description: 'The import process has been restarted',
      });
    } catch (error: any) {
      toast({
        title: 'Failed to retry import',
        description:
          error?.message || 'An error occurred while retrying the import',
        variant: 'destructive',
      });
    }
  }, [importProgress._id, retryImport, toast]);

  const handleResume = useCallback(async () => {
    try {
      await resumeImport(importProgress._id);
      toast({
        title: 'Import resumed',
        description: 'The import process has been resumed',
      });
    } catch (error: any) {
      toast({
        title: 'Failed to resume import',
        description:
          error?.message || 'An error occurred while resuming the import',
        variant: 'destructive',
      });
    }
  }, [importProgress._id, resumeImport, toast]);

  const canCancel = useMemo(
    () =>
      ['pending', 'validating', 'processing'].includes(importProgress.status),
    [importProgress.status],
  );

  const canRetry = useMemo(
    () => importProgress.status === 'failed',
    [importProgress.status],
  );

  const canResume = useMemo(
    () => importProgress.status === 'cancelled',
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
