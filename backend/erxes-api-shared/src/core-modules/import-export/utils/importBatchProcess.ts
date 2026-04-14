import { Job, UnrecoverableError } from 'bullmq';
import { nanoid } from 'nanoid';
import * as fs from 'fs';
import { splitType } from '../../../core-modules/automations';
import { readFileStreamFromStorage } from '../../../utils/file/read';
import { IImportExportContext, TImportHandlers, ImportJobData } from '../types';
import { CoreImportClient } from './createCoreImportClient';
import { ImportExportError, withImportExportStage } from './importExportError';
import {
  logImportExportEvent,
  safeCleanup,
  toTerminalImportExportError,
} from './importExportRuntime';
import { processCSVStream, processXLSXStream } from './importUtils';
import { safeProgressUpdate } from './progressUpdate';
import {
  ImportExportTempWorkspace,
  createImportExportTempWorkspace,
} from './tempWorkspace';

type ImportErrorRow = Record<string, any>;

interface ImportErrorRowWriter {
  writeRows(rows: ImportErrorRow[]): Promise<void>;
  finalize(): Promise<void>;
  cleanup(): Promise<void>;
  getErrorRows(): ImportErrorRow[];
  hasErrors(): boolean;
}

const createContext = async (
  subdomain: string,
  baseContext: IImportExportContext,
  config: TImportHandlers,
): Promise<IImportExportContext> => {
  // if (config.createContext) {
  //   return await config.createContext(subdomain, baseContext);
  // }

  return baseContext;
};

const escapeCsvField = (
  field: string | number | boolean | null | undefined,
): string => {
  const value =
    field === null || field === undefined
      ? ''
      : typeof field === 'string'
        ? field
        : String(field);

  if (value.includes('"') || value.includes(',') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`;
  }

  return value;
};

const createImportErrorRowWriter = async ({
  importId,
  getCsvHeaders,
  keyToHeaderMap,
  tempWorkspace,
}: {
  importId: string;
  getCsvHeaders: () => string[];
  keyToHeaderMap: Record<string, string>;
  tempWorkspace: ImportExportTempWorkspace;
}): Promise<ImportErrorRowWriter> => {
  const errorFilePath = tempWorkspace.createFilePath(
    `import-errors-${importId}-${nanoid()}.csv`,
  );

  const stream = fs.createWriteStream(errorFilePath, { encoding: 'utf8' });
  let initialized = false;
  let streamError: Error | null = null;
  const bufferedErrorRows: ImportErrorRow[] = [];

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

  const ensureHeader = async () => {
    if (initialized) {
      return;
    }

    const finalHeaders = [...getCsvHeaders(), 'Error'];
    await writeChunk(finalHeaders.map(escapeCsvField).join(',') + '\n');
    initialized = true;
  };

  return {
    async writeRows(rows) {
      if (!rows.length) {
        return;
      }

      await ensureHeader();

      const csvHeaders = getCsvHeaders();
      const headerToKeyMap: Record<string, string> = {};

      Object.entries(keyToHeaderMap).forEach(([key, header]) => {
        headerToKeyMap[header] = key;
      });

      const chunk =
        rows
          .map((row) => {
            const errorMessage =
              row?.error ||
              row?.errorMessage ||
              row?.message ||
              'Unknown error';

            const normalizedRow: ImportErrorRow = { error: errorMessage };

            const values = csvHeaders.map((header) => {
              const lookupKey = keyToHeaderMap[header] || header;
              const value = row?.[lookupKey];
              normalizedRow[lookupKey] = value;
              return escapeCsvField(value);
            });

            bufferedErrorRows.push(normalizedRow);

            values.push(escapeCsvField(errorMessage));
            return values.join(',');
          })
          .join('\n') + '\n';

      await writeChunk(chunk);
    },

    async finalize() {
      if (streamError) {
        throw streamError;
      }

      await new Promise<void>((resolve, reject) => {
        stream.end((err) => {
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

    getErrorRows() {
      return bufferedErrorRows;
    },

    hasErrors() {
      return bufferedErrorRows.length > 0;
    },
  };
};

export const createImportBatchProcessor = (
  config: TImportHandlers,
  coreClient: CoreImportClient,
  pluginName: string,
) => {
  return async (job: Job<ImportJobData>) => {
    const { subdomain, data } = job.data;
    const { importId, entityType, fileKey } = data;
    const [jobPluginName, moduleName, collectionName] = splitType(entityType);

    if (jobPluginName !== pluginName) {
      return;
    }

    if (!config.insertImportRows) {
      throw new Error('insertImportRows handler is not defined');
    }

    if (!config.getImportHeaders) {
      throw new Error('getImportHeaders handler is not defined');
    }

    const processId = nanoid(12);
    const context = await createContext(
      subdomain,
      { subdomain, processId },
      config,
    );
    let dataRowIndex = 0;
    let totalRows = 0;
    let processedRows = 0;
    let successRows = 0;
    let errorRows = 0;
    const startedAt = Date.now();

    logImportExportEvent({
      entity: 'import',
      id: importId,
      subdomain,
      stage: 'START',
      event: 'job_started',
      extra: {
        entityType,
        fileKey,
      },
    });

    try {
      await safeProgressUpdate({
        entity: 'import',
        id: importId,
        subdomain,
        stage: 'validating',
        update: async () => {
          await coreClient.updateImportProgress(subdomain, importId, {
            status: 'validating',
          });
        },
      });

      const importDoc = await withImportExportStage({
        stage: 'LOAD_DOCUMENT',
        fallbackMessage: 'Failed to load import document',
        retryable: false,
        run: async () => await coreClient.getImport(subdomain, importId),
      });
      if (!importDoc) {
        throw new ImportExportError({
          stage: 'LOAD_DOCUMENT',
          message: 'Import not found',
          code: 'IMPORT_NOT_FOUND',
          retryable: false,
        });
      }

      const fileName = importDoc.fileName || fileKey;
      const isCSV = fileName.toLowerCase().endsWith('.csv');
      const resumeFromRow = importDoc.lastProcessedRow || 0;

      // Native Readable stream from storage — the file is never fully
      // buffered in memory. Storage errors (NoSuchKey, connection drop,
      // etc.) surface via the stream's 'error' event, which is forwarded
      // into the parser by processCSVStream/processXLSXStream and then
      // thrown out of the for-await loop below, landing in the outer catch.
      const fileStream = await withImportExportStage({
        stage: 'FETCH_FILE',
        fallbackMessage: 'Failed to fetch import file',
        run: async () =>
          await readFileStreamFromStorage({
            subdomain,
            key: fileKey,
          }),
      });

      const batchSize = 5000;
      let batch: any[] = [];

      await safeProgressUpdate({
        entity: 'import',
        id: importId,
        subdomain,
        stage: 'processing',
        update: async () => {
          await coreClient.updateImportProgress(subdomain, importId, {
            status: 'processing',
          });
        },
      });

      const importHeaders = await withImportExportStage({
        stage: 'FETCH_HEADERS',
        fallbackMessage: 'Failed to fetch import headers',
        retryable: false,
        run: async () =>
          await config.getImportHeaders(
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

      const rowIterator = isCSV
        ? processCSVStream(fileStream)
        : processXLSXStream(fileStream);

      let rowIndex = 0;
      let headerRow: string[] = [];
      const columnToKeyMap: Record<number, string> = {};
      const keyToHeaderMap: Record<string, string> = {};

      const getCsvHeaders = (): string[] => {
        return headerRow && headerRow.length > 0
          ? headerRow
          : Object.values(keyToHeaderMap);
      };

      const tempWorkspace = await createImportExportTempWorkspace({
        kind: 'import',
      });

      try {
        const errorRowWriter = await withImportExportStage({
          stage: 'WRITE_TEMP_FILE',
          fallbackMessage: 'Failed to initialize import error writer',
          run: async () =>
            await createImportErrorRowWriter({
              importId,
              getCsvHeaders,
              keyToHeaderMap,
              tempWorkspace,
            }),
        });
        let errorRowWriterFinalized = false;

        for await (const row of rowIterator) {
          if (rowIndex === 0) {
            headerRow = row;
            headerRow.forEach((headerText, index) => {
              if (headerText) {
                const matchedHeader = importHeaders.find(
                  (h) => h.label === headerText,
                );
                if (matchedHeader) {
                  columnToKeyMap[index] = matchedHeader.key;
                  keyToHeaderMap[matchedHeader.key] = headerText;
                }
              }
            });
            rowIndex++;
            continue;
          }

          dataRowIndex++;
          rowIndex++;

          if (dataRowIndex <= resumeFromRow) {
            continue;
          }

          totalRows++;

          const rowData: Record<string, any> = {};
          row.forEach((value: any, index: number) => {
            if (
              index >= 0 &&
              value !== null &&
              value !== undefined &&
              value !== ''
            ) {
              const key = columnToKeyMap[index];
              if (key) {
                rowData[key] = value;
              }
            }
          });

          if (Object.keys(rowData).length > 0) {
            batch.push(rowData);
          }

          if (batch.length >= batchSize) {
            const result = await withImportExportStage({
              stage: 'PROCESS_BATCH',
              fallbackMessage: 'Failed to process import batch',
              run: async () =>
                await config.insertImportRows(
                  {
                    subdomain,
                    data: {
                      moduleName,
                      collectionName,
                      rows: batch,
                    },
                  },
                  context,
                ),
            });

            const successIds =
              result.successRows
                ?.map((r: any) => r._id || r.id)
                .filter(Boolean) || [];

            successRows += successIds.length;
            errorRows += result.errorRows.length;
            processedRows += batch.length;

            if (result.errorRows.length) {
              await withImportExportStage({
                stage: 'WRITE_TEMP_FILE',
                fallbackMessage: 'Failed to write import error rows',
                run: async () =>
                  await errorRowWriter.writeRows(result.errorRows),
              });
            }

            await safeProgressUpdate({
              entity: 'import',
              id: importId,
              subdomain,
              stage: 'batch-progress',
              update: async () => {
                await coreClient.updateImportProgress(subdomain, importId, {
                  processedRows,
                  successRows,
                  errorRows,
                  totalRows,
                  lastProcessedRow: dataRowIndex,
                });
              },
            });

            logImportExportEvent({
              entity: 'import',
              id: importId,
              subdomain,
              stage: 'PROCESS_BATCH',
              event: 'batch_processed',
              extra: {
                processedRows,
                successRows,
                errorRows,
                totalRows,
                lastProcessedRow: dataRowIndex,
              },
            });

            if (successIds.length) {
              await coreClient.addImportedIds(subdomain, importId, successIds);
            }

            batch = [];
          }
        }

        if (batch.length > 0) {
          const result = await withImportExportStage({
            stage: 'PROCESS_BATCH',
            fallbackMessage: 'Failed to process final import batch',
            run: async () =>
              await config.insertImportRows(
                {
                  subdomain,
                  data: {
                    moduleName,
                    collectionName,
                    rows: batch,
                  },
                },
                context,
              ),
          });

          const successIds =
            result.successRows
              ?.map((r: any) => r._id || r.id)
              .filter(Boolean) || [];

          successRows += successIds.length;
          errorRows += result.errorRows.length;
          processedRows += batch.length;

          if (result.errorRows.length) {
            await withImportExportStage({
              stage: 'WRITE_TEMP_FILE',
              fallbackMessage: 'Failed to write final import error rows',
              run: async () => await errorRowWriter.writeRows(result.errorRows),
            });
          }

          await safeProgressUpdate({
            entity: 'import',
            id: importId,
            subdomain,
            stage: 'final-batch-progress',
            update: async () => {
              await coreClient.updateImportProgress(subdomain, importId, {
                processedRows,
                successRows,
                errorRows,
                totalRows,
                lastProcessedRow: dataRowIndex,
              });
            },
          });

          logImportExportEvent({
            entity: 'import',
            id: importId,
            subdomain,
            stage: 'PROCESS_BATCH',
            event: 'final_batch_processed',
            extra: {
              processedRows,
              successRows,
              errorRows,
              totalRows,
              lastProcessedRow: dataRowIndex,
            },
          });

          if (successIds.length) {
            await coreClient.addImportedIds(subdomain, importId, successIds);
          }
        }

        let errorFileUrl: string | null = null;
        await withImportExportStage({
          stage: 'FINALIZE_UPLOAD',
          fallbackMessage: 'Failed to finalize import error file',
          run: async () => await errorRowWriter.finalize(),
        });

        if (errorRowWriter.hasErrors()) {
          errorFileUrl = await withImportExportStage({
            stage: 'SAVE_RESULT',
            fallbackMessage: 'Failed to save import error file',
            run: async () =>
              await coreClient.saveErrorFile(subdomain, {
                importId,
                headerRow,
                errorRows: errorRowWriter.getErrorRows(),
                keyToHeaderMap,
              }),
          });
        }

        await coreClient.updateImportProgress(subdomain, importId, {
          status: 'completed',
          processedRows,
          successRows,
          errorRows,
          totalRows,
          lastProcessedRow: dataRowIndex,
          terminalError: undefined,
          ...(errorFileUrl && { errorFileUrl }),
        });

        logImportExportEvent({
          entity: 'import',
          id: importId,
          subdomain,
          stage: 'COMPLETE',
          event: 'job_completed',
          extra: {
            processedRows,
            successRows,
            errorRows,
            totalRows,
            lastProcessedRow: dataRowIndex,
            durationMs: Date.now() - startedAt,
          },
        });

        return { success: true };
      } finally {
        await safeCleanup({
          label: `import temp workspace ${importId}`,
          run: async () => {
            await tempWorkspace.cleanup();
          },
        });
      }
    } catch (error: any) {
      const importExportError =
        error instanceof ImportExportError ? error : undefined;
      const terminalError = toTerminalImportExportError(error);
      const errorCode = `${terminalError.code} @ ${terminalError.stage}`;

      logImportExportEvent({
        level: 'error',
        entity: 'import',
        id: importId,
        subdomain,
        stage: terminalError.stage || 'FAILED',
        event: 'job_failed',
        extra: {
          code: terminalError.code,
          retryable: terminalError.retryable,
          message: terminalError.message,
          processedRows,
          successRows,
          errorRows,
          totalRows,
          lastProcessedRow: dataRowIndex,
          durationMs: Date.now() - startedAt,
        },
      });
      await coreClient.updateImportProgress(subdomain, importId, {
        status: 'failed',
        lastProcessedRow: dataRowIndex,
        errorMessage: `${errorCode}: ${
          error?.message || 'Import worker failed'
        }`,
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
