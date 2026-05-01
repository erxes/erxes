import { splitType } from '../../../core-modules/automations';
import {
  TExportHandlers,
  ExportJobData,
  IImportExportContext,
  GetExportDataArgs,
} from '../types';
import { CoreImportClient } from './createCoreImportClient';
import { Job, UnrecoverableError } from 'bullmq';
import { nanoid } from 'nanoid';
import * as fs from 'fs';
import * as path from 'path';
import ExcelJS from 'exceljs';
import { ImportExportError, withImportExportStage } from './importExportError';
import {
  logImportExportEvent,
  safeCleanup,
  toTerminalImportExportError,
} from './importExportRuntime';
import { safeProgressUpdate } from './progressUpdate';
import { createImportExportTempWorkspace } from './tempWorkspace';

const BATCH_SIZE = 5000;

type ExportRow = Record<string, any>;

interface ExportRowWriter {
  writeRows(rows: ExportRow[]): Promise<void>;
  finalize(): Promise<void>;
  cleanup(): Promise<void>;
}

const escapeCsvField = (value: any): string => {
  if (value === null || value === undefined) {
    return '';
  }

  const stringValue = String(value);
  if (
    stringValue.includes(',') ||
    stringValue.includes('"') ||
    stringValue.includes('\n') ||
    stringValue.includes('\r')
  ) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }

  return stringValue;
};

const createContext = (
  subdomain: string,
  baseContext: IImportExportContext,
): IImportExportContext => {
  return baseContext;
};

const createCSVRowWriter = async ({
  filePath,
  headerLabels,
  headerKeys,
}: {
  filePath: string;
  headerLabels: string[];
  headerKeys: string[];
}): Promise<ExportRowWriter> => {
  const stream = fs.createWriteStream(filePath, { encoding: 'utf8' });
  let streamError: Error | null = null;

  stream.on('error', (err) => {
    streamError = err;
  });

  const writeChunk = async (chunk: string) => {
    if (streamError) {
      throw streamError;
    }

    await new Promise<void>((resolve, reject) => {
      const cleanupListeners = () => {
        stream.off('error', onError);
        stream.off('drain', onDrain);
      };

      const onError = (err: Error) => {
        cleanupListeners();
        reject(err);
      };

      const onDrain = () => {
        cleanupListeners();
        resolve();
      };

      stream.once('error', onError);

      const canContinue = stream.write(chunk, (err) => {
        if (err) {
          cleanupListeners();
          reject(err);
        }
      });

      if (canContinue) {
        cleanupListeners();
        resolve();
        return;
      }

      stream.once('drain', onDrain);
    });
  };

  await writeChunk(
    '\uFEFF' + headerLabels.map(escapeCsvField).join(',') + '\n',
  );

  return {
    async writeRows(rows) {
      if (!rows.length) {
        return;
      }

      const chunk =
        rows
          .map((row) =>
            headerKeys.map((key) => escapeCsvField(row[key])).join(','),
          )
          .join('\n') + '\n';

      await writeChunk(chunk);
    },

    async finalize() {
      if (streamError) {
        throw streamError;
      }

      await new Promise<void>((resolve, reject) => {
        stream.end((err: any) => {
          if (err) {
            reject(err);
            return;
          }

          resolve();
        });
      });

      if (streamError) {
        throw streamError;
      }
    },

    async cleanup() {
      if (!stream.destroyed) {
        stream.destroy();
      }
    },
  };
};

const createXLSXRowWriter = async ({
  filePath,
  headerLabels,
  headerKeys,
}: {
  filePath: string;
  headerLabels: string[];
  headerKeys: string[];
}): Promise<ExportRowWriter> => {
  const workbook = new ExcelJS.stream.xlsx.WorkbookWriter({
    filename: filePath,
    useStyles: false,
    useSharedStrings: false,
  });

  const worksheet = workbook.addWorksheet('Export');
  worksheet.addRow(headerLabels).commit();

  let finalized = false;

  return {
    async writeRows(rows) {
      for (const row of rows) {
        worksheet.addRow(headerKeys.map((key) => row[key] ?? '')).commit();
      }
    },

    async finalize() {
      if (finalized) {
        return;
      }

      worksheet.commit();
      await workbook.commit();
      finalized = true;
    },

    async cleanup() {
      // ExcelJS streaming writer does not expose an explicit destroy API.
      // The temporary file is removed by the caller in the surrounding finally.
    },
  };
};

const createExportRowWriter = ({
  fileFormat,
  filePath,
  headerLabels,
  headerKeys,
}: {
  fileFormat: 'csv' | 'xlsx';
  filePath: string;
  headerLabels: string[];
  headerKeys: string[];
}): Promise<ExportRowWriter> => {
  if (fileFormat === 'csv') {
    return createCSVRowWriter({ filePath, headerLabels, headerKeys });
  }

  return createXLSXRowWriter({ filePath, headerLabels, headerKeys });
};

const uploadExportFile = async (
  subdomain: string,
  filePath: string,
  fileName: string,
  fileFormat: 'csv' | 'xlsx',
  coreClient: CoreImportClient,
): Promise<string> => {
  const mimeType =
    fileFormat === 'csv'
      ? 'text/csv'
      : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

  const fileContent = (await fs.promises.readFile(filePath)).toString('base64');
  return await coreClient.uploadExportFile(subdomain, {
    fileContent,
    fileName,
    mimeType,
  });
};

export const createExportBatchProcessor = (
  config: TExportHandlers,
  coreClient: CoreImportClient,
  pluginName: string,
) => {
  return async (job: Job<ExportJobData>) => {
    const { subdomain, data } = job.data;
    const { exportId, entityType, fileFormat } = data;
    const [jobPluginName, moduleName, collectionName] = splitType(entityType);

    if (jobPluginName !== pluginName) {
      return;
    }

    if (!config.getExportHeaders) {
      throw new Error('getExportHeaders handler is not defined');
    }

    if (!config.getExportData) {
      throw new Error('getExportData handler is not defined');
    }

    const processId = nanoid(12);
    const context = await createContext(subdomain, { subdomain, processId });

    // Declare cursor outside try block for error recovery
    let cursor: string | undefined;
    let totalRows = 0;
    let processedRows = 0;
    let fileKey: string | undefined;
    const startedAt = Date.now();

    logImportExportEvent({
      entity: 'export',
      id: exportId,
      subdomain,
      stage: 'START',
      event: 'job_started',
      extra: {
        entityType,
        fileFormat,
      },
    });

    try {
      await safeProgressUpdate({
        entity: 'export',
        id: exportId,
        subdomain,
        stage: 'validating',
        update: async () => {
          await coreClient.updateExportProgress(subdomain, exportId, {
            status: 'validating',
          });
        },
      });

      const exportDoc = await withImportExportStage({
        stage: 'LOAD_DOCUMENT',
        fallbackMessage: 'Failed to load export document',
        retryable: false,
        run: async () => await coreClient.getExport(subdomain, exportId),
      });
      if (!exportDoc) {
        throw new ImportExportError({
          stage: 'LOAD_DOCUMENT',
          message: 'Export not found',
          code: 'EXPORT_NOT_FOUND',
          retryable: false,
        });
      }

      await safeProgressUpdate({
        entity: 'export',
        id: exportId,
        subdomain,
        stage: 'processing',
        update: async () => {
          await coreClient.updateExportProgress(subdomain, exportId, {
            status: 'processing',
          });
        },
      });

      const exportHeaders = await withImportExportStage({
        stage: 'FETCH_HEADERS',
        fallbackMessage: 'Failed to fetch export headers',
        retryable: false,
        run: async () =>
          await config.getExportHeaders(
            {
              subdomain,
              data: {
                moduleName,
                collectionName,
              },
            },
            context,
          ),
      });

      // Use selectedFields if provided, otherwise use all headers
      const selectedFields =
        exportDoc.selectedFields && exportDoc.selectedFields.length > 0
          ? exportDoc.selectedFields
          : exportHeaders.map((h: { label: string; key: string }) => h.key);

      const headerLabels = exportHeaders
        .filter((h: { label: string; key: string }) =>
          selectedFields.includes(h.key),
        )
        .map((h: { label: string; key: string }) => h.label);
      const headerKeys = selectedFields;

      const tempWorkspace = await createImportExportTempWorkspace({
        kind: 'export',
      });

      try {
        const tempFileName = `export-${exportId}.${fileFormat}`;
        const tempFilePath = tempWorkspace.createFilePath(tempFileName);
        const writer = await withImportExportStage({
          stage: 'WRITE_TEMP_FILE',
          fallbackMessage: 'Failed to initialize export writer',
          run: async () =>
            await createExportRowWriter({
              fileFormat,
              filePath: tempFilePath,
              headerLabels,
              headerKeys,
            }),
        });
        let writerFinalized = false;

        try {
          // Resume from last cursor if export was interrupted
          cursor = exportDoc.lastCursor;
          let hasMoreData = true;
          const startTime = Date.now();
          let lastProgressUpdate = Date.now();

          while (hasMoreData) {
            const exportDataArgs = {
              subdomain,
              data: {
                moduleName,
                collectionName,
                limit: BATCH_SIZE,
                ...(cursor ? { cursor } : {}),
                ...(exportDoc.filters ? { filters: exportDoc.filters } : {}),
                ...(exportDoc.ids && exportDoc.ids.length > 0
                  ? { ids: exportDoc.ids }
                  : {}),
                ...(exportDoc.selectedFields &&
                exportDoc.selectedFields.length > 0
                  ? { selectedFields: exportDoc.selectedFields }
                  : {}),
              },
            } as GetExportDataArgs;

            const batch = await withImportExportStage({
              stage: 'PROCESS_BATCH',
              fallbackMessage: 'Failed to fetch export batch',
              run: async () =>
                await config.getExportData(exportDataArgs, context),
            });

            if (batch.length === 0) {
              break;
            }

            const mappedRows = batch.map((row: Record<string, any>) => {
              const mappedRow: Record<string, any> = {};
              headerKeys.forEach((key: string) => {
                mappedRow[key] = row[key] ?? '';
              });
              return mappedRow;
            });

            await withImportExportStage({
              stage: 'WRITE_TEMP_FILE',
              fallbackMessage: 'Failed to write export rows',
              run: async () => await writer.writeRows(mappedRows),
            });

            totalRows += batch.length;
            processedRows += batch.length;

            // Get cursor from last item for next iteration
            const lastItem = batch[batch.length - 1];

            // When ids are provided, use index-based cursor
            if (exportDoc.ids && exportDoc.ids.length > 0) {
              const currentIndex = cursor ? Number.parseInt(cursor, 10) : 0;
              const nextIndex = currentIndex + batch.length;
              if (nextIndex >= exportDoc.ids.length) {
                hasMoreData = false;
              } else {
                cursor = String(nextIndex);
              }
            } else if (lastItem?._id) {
              cursor = lastItem._id;
              // If batch is smaller than BATCH_SIZE, we've reached the end
              if (batch.length < BATCH_SIZE) {
                hasMoreData = false;
              }
            } else {
              hasMoreData = false;
            }

            // Update progress with time estimation (every 2 seconds)
            const now = Date.now();
            const shouldUpdateProgress = now - lastProgressUpdate > 2000;

            if (shouldUpdateProgress && processedRows > 0) {
              const elapsedSeconds = (now - startTime) / 1000;
              const rowsPerSecond = processedRows / elapsedSeconds;
              const remainingRows =
                totalRows > 0 ? totalRows - processedRows : undefined;
              const estimatedSecondsRemaining = remainingRows
                ? remainingRows / rowsPerSecond
                : undefined;

              await safeProgressUpdate({
                entity: 'export',
                id: exportId,
                subdomain,
                stage: 'batch-progress',
                update: async () => {
                  await coreClient.updateExportProgress(subdomain, exportId, {
                    processedRows,
                    totalRows: totalRows || processedRows,
                    lastCursor: cursor,
                    estimatedSecondsRemaining,
                  });
                },
              });

              logImportExportEvent({
                entity: 'export',
                id: exportId,
                subdomain,
                stage: 'PROCESS_BATCH',
                event: 'batch_processed',
                extra: {
                  processedRows,
                  totalRows,
                  lastCursor: cursor,
                },
              });

              lastProgressUpdate = now;
            }
          }

          await withImportExportStage({
            stage: 'FINALIZE_UPLOAD',
            fallbackMessage: 'Failed to finalize export file',
            run: async () => await writer.finalize(),
          });
          writerFinalized = true;

          fileKey = await withImportExportStage({
            stage: 'FINALIZE_UPLOAD',
            fallbackMessage: 'Failed to upload export file',
            run: async () =>
              await uploadExportFile(
                subdomain,
                tempFilePath,
                tempFileName,
                fileFormat,
                coreClient,
              ),
          });

          const baseFileName = exportDoc.fileName || `export-${exportId}`;
          const fileName = `${baseFileName}.${fileFormat}`;

          await withImportExportStage({
            stage: 'SAVE_RESULT',
            fallbackMessage: 'Failed to save export file metadata',
            run: async () => {
              if (!fileKey) {
                throw new Error('Export file key was not generated');
              }
              await coreClient.saveExportFile(subdomain, {
                exportId,
                fileKey,
                fileName,
              });
            },
          });
        } finally {
          if (!writerFinalized) {
            await writer.cleanup().catch(() => undefined);
          }
        }
      } finally {
        await safeCleanup({
          label: `export temp workspace ${exportId}`,
          run: async () => {
            await tempWorkspace.cleanup();
          },
        });
      }

      await coreClient.updateExportProgress(subdomain, exportId, {
        status: 'completed',
        processedRows,
        totalRows: totalRows || processedRows,
        lastCursor: undefined,
        fileKey,
        terminalError: undefined,
      });

      logImportExportEvent({
        entity: 'export',
        id: exportId,
        subdomain,
        stage: 'COMPLETE',
        event: 'job_completed',
        extra: {
          processedRows,
          totalRows,
          durationMs: Date.now() - startedAt,
        },
      });

      return { success: true, fileKey: fileKey || '' };
    } catch (error: any) {
      const importExportError =
        error instanceof ImportExportError ? error : undefined;
      const terminalError = toTerminalImportExportError(error);
      const errorCode = `${terminalError.code} @ ${terminalError.stage}`;

      logImportExportEvent({
        level: 'error',
        entity: 'export',
        id: exportId,
        subdomain,
        stage: terminalError.stage || 'FAILED',
        event: 'job_failed',
        extra: {
          code: terminalError.code,
          retryable: terminalError.retryable,
          message: terminalError.message,
          processedRows,
          totalRows,
          lastCursor: cursor,
          durationMs: Date.now() - startedAt,
        },
      });
      // Save last cursor for resume capability
      await coreClient.updateExportProgress(subdomain, exportId, {
        status: 'failed',
        errorMessage: `${errorCode}: ${
          error?.message || 'Export worker failed'
        }`,
        lastCursor: cursor,
        terminalError: {
          code: terminalError.code,
          stage: terminalError.stage,
          retryable: terminalError.retryable,
        },
      });
      if (importExportError && !importExportError.retryable) {
        throw new UnrecoverableError(importExportError.message);
      }
      throw error;
    }
  };
};
