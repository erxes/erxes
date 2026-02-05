import { splitType } from '../../../core-modules/automations';
import {
  TExportHandlers,
  ExportJobData,
  IImportExportContext,
  GetExportDataArgs,
} from '../types';
import { CoreImportClient } from './createCoreImportClient';
import { Job } from 'bullmq';
import { nanoid } from 'nanoid';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import ExcelJS from 'exceljs';
import { uploadFileToStorage } from '../../../utils/file/upload';

const BATCH_SIZE = 5000;

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

const createContext = async (
  subdomain: string,
  baseContext: IImportExportContext,
): Promise<IImportExportContext> => {
  return baseContext;
};

const writeCSVFile = async (
  filePath: string,
  headerLabels: string[],
  headerKeys: string[],
  rows: Record<string, any>[],
): Promise<void> => {
  const csvLines: string[] = [];
  csvLines.push(headerLabels.map(escapeCsvField).join(','));

  for (const row of rows) {
    const values = headerKeys.map((key) => {
      return escapeCsvField(row[key] ?? '');
    });
    csvLines.push(values.join(','));
  }

  await fs.promises.writeFile(filePath, csvLines.join('\n'), 'utf8');
};

const writeXLSXFile = async (
  filePath: string,
  headerLabels: string[],
  headerKeys: string[],
  rows: Record<string, any>[],
): Promise<void> => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Export');

  worksheet.addRow(headerLabels);

  for (const row of rows) {
    const values = headerKeys.map((key) => {
      return row[key] ?? '';
    });
    worksheet.addRow(values);
  }

  await workbook.xlsx.writeFile(filePath);
};

const uploadExportFile = async (
  subdomain: string,
  filePath: string,
  fileName: string,
  fileFormat: 'csv' | 'xlsx',
): Promise<string> => {
  const mimetype =
    fileFormat === 'csv'
      ? 'text/csv'
      : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

  // Force private to get file key instead of URL (same pattern as core-api)
  return await uploadFileToStorage({
    subdomain,
    filePath,
    fileName,
    mimetype,
    forcePrivate: true,
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

    try {
      await coreClient.updateExportProgress(subdomain, exportId, {
        status: 'validating',
      });

      const exportDoc = await coreClient.getExport(subdomain, exportId);
      if (!exportDoc) {
        throw new Error('Export not found');
      }

      await coreClient.updateExportProgress(subdomain, exportId, {
        status: 'processing',
      });

      const exportHeaders = await config.getExportHeaders(
        {
          subdomain,
          data: {
            moduleName,
            collectionName,
          },
        },
        context,
      );

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

      let totalRows = 0;
      let processedRows = 0;
      const allRows: Record<string, any>[] = [];
      let fileKey: string | undefined;

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
            ...(exportDoc.selectedFields && exportDoc.selectedFields.length > 0
              ? { selectedFields: exportDoc.selectedFields }
              : {}),
          },
        } as GetExportDataArgs;

        const batch = await config.getExportData(exportDataArgs, context);

        if (batch.length === 0) {
          hasMoreData = false;
          break;
        }

        const mappedRows = batch.map((row: Record<string, any>) => {
          const mappedRow: Record<string, any> = {};
          headerKeys.forEach((key: string) => {
            mappedRow[key] = row[key] ?? '';
          });
          return mappedRow;
        });

        allRows.push(...mappedRows);
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
        } else if (lastItem && lastItem._id) {
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

          await coreClient.updateExportProgress(subdomain, exportId, {
            processedRows,
            totalRows: totalRows || processedRows,
            lastCursor: cursor,
            estimatedSecondsRemaining,
          });

          lastProgressUpdate = now;
        }
      }

      // Write all rows to a single file
      if (allRows.length > 0) {
        const tempFileName = `export-${exportId}.${fileFormat}`;
        const tempFilePath = path.join(os.tmpdir(), tempFileName);

        try {
          if (fileFormat === 'csv') {
            await writeCSVFile(tempFilePath, headerLabels, headerKeys, allRows);
          } else {
            await writeXLSXFile(
              tempFilePath,
              headerLabels,
              headerKeys,
              allRows,
            );
          }

          fileKey = await uploadExportFile(
            subdomain,
            tempFilePath,
            tempFileName,
            fileFormat,
          );

          const baseFileName = exportDoc.fileName || `export-${exportId}`;
          const fileName = `${baseFileName}.${fileFormat}`;

          await coreClient.saveExportFile(subdomain, {
            exportId,
            fileKey,
            fileName,
          });
        } finally {
          await fs.promises
            .unlink(tempFilePath)
            .catch(() => Promise.resolve(undefined));
        }
      }

      await coreClient.updateExportProgress(subdomain, exportId, {
        status: 'completed',
        processedRows,
        totalRows: totalRows || processedRows,
        lastCursor: undefined,
      });

      return { success: true, fileKey: fileKey || '' };
    } catch (error: any) {
      // Save last cursor for resume capability
      await coreClient.updateExportProgress(subdomain, exportId, {
        status: 'failed',
        errorMessage: error?.message || 'Export worker failed',
        lastCursor: cursor,
      });
      throw error;
    }
  };
};
