import { ImportExportError } from './importExportError';

export const getImportExportJobOptions = ({
  attempts = 2,
  backoffDelay = 2000,
}: {
  attempts?: number;
  backoffDelay?: number;
}) => {
  return {
    attempts,
    backoff: {
      type: 'exponential' as const,
      delay: backoffDelay,
    },
    removeOnComplete: 50,
    removeOnFail: 100,
  };
};

export const toTerminalImportExportError = (error: unknown) => {
  if (error instanceof ImportExportError) {
    return {
      code: error.code,
      stage: error.stage,
      retryable: error.retryable,
      message: error.message,
    };
  }

  return {
    code: 'IMPORT_EXPORT_UNKNOWN',
    stage: 'UPDATE_STATUS',
    retryable: true,
    message:
      error instanceof Error ? error.message : 'Unknown import/export error',
  };
};

export const logImportExportEvent = ({
  level = 'info',
  entity,
  id,
  subdomain,
  stage,
  event,
  extra,
}: {
  level?: 'info' | 'warn' | 'error';
  entity: 'import' | 'export';
  id: string;
  subdomain: string;
  stage: string;
  event: string;
  extra?: Record<string, unknown>;
}) => {
  const line = JSON.stringify({
    scope: 'import-export',
    entity,
    id,
    subdomain,
    stage,
    event,
    ...(extra || {}),
  });

  if (level === 'error') {
    console.error(line);
    return;
  }

  if (level === 'warn') {
    console.warn(line);
    return;
  }

  console.log(line);
};

export const safeCleanup = async ({
  label,
  run,
}: {
  label: string;
  run: () => Promise<void>;
}) => {
  try {
    await run();
  } catch (error: any) {
    console.warn(
      `[ImportExport] Cleanup failed at ${label}: ${
        error?.message || 'Unknown error'
      }`,
    );
  }
};
