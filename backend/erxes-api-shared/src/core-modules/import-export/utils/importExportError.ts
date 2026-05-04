export type ImportExportStage =
  | 'LOAD_DOCUMENT'
  | 'FETCH_FILE'
  | 'FETCH_HEADERS'
  | 'PARSE_ROWS'
  | 'PROCESS_BATCH'
  | 'WRITE_TEMP_FILE'
  | 'FINALIZE_UPLOAD'
  | 'SAVE_RESULT'
  | 'UPDATE_STATUS';

export class ImportExportError extends Error {
  stage: ImportExportStage;
  code: string;
  retryable: boolean;
  cause?: unknown;

  constructor({
    stage,
    message,
    code = 'IMPORT_EXPORT_STAGE_FAILED',
    retryable = true,
    cause,
  }: {
    stage: ImportExportStage;
    message: string;
    code?: string;
    retryable?: boolean;
    cause?: unknown;
  }) {
    super(message);
    this.name = 'ImportExportError';
    this.stage = stage;
    this.code = code;
    this.retryable = retryable;
    this.cause = cause;
  }
}

export const withImportExportStage = async <T>({
  stage,
  run,
  fallbackMessage,
  code = 'IMPORT_EXPORT_STAGE_FAILED',
  retryable = true,
}: {
  stage: ImportExportStage;
  run: () => Promise<T>;
  fallbackMessage: string;
  code?: string;
  retryable?: boolean;
}): Promise<T> => {
  try {
    return await run();
  } catch (error) {
    if (error instanceof ImportExportError) {
      throw error;
    }

    const message =
      error instanceof Error && error.message ? error.message : fallbackMessage;

    throw new ImportExportError({
      stage,
      message,
      code,
      retryable,
      cause: error,
    });
  }
};
