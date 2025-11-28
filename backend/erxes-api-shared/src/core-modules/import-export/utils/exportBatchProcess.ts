import { splitType } from '../../../core-modules/automations';
import { ExportHandlers, ExportJobData, IImportExportContext } from '../types';
import { CoreImportClient } from './createCoreImportClient';
import { Job } from 'bullmq';
import { nanoid } from 'nanoid';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import ExcelJS from 'exceljs';

const ROWS_PER_FILE = 50000;
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
  headers: string[],
  rows: Record<string, any>[],
): Promise<void> => {
  const csvLines: string[] = [];
  csvLines.push(headers.map(escapeCsvField).join(','));

  for (const row of rows) {
    const values = headers.map((header) => {
      const key = header.toLowerCase().replace(/\s+/g, '');
      return escapeCsvField(row[key] || row[header] || '');
    });
    csvLines.push(values.join(','));
  }

  await fs.promises.writeFile(filePath, csvLines.join('\n'), 'utf8');
};

const writeXLSXFile = async (
  filePath: string,
  headers: string[],
  rows: Record<string, any>[],
): Promise<void> => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Export');

  worksheet.addRow(headers);

  for (const row of rows) {
    const values = headers.map((header) => {
      const key = header.toLowerCase().replace(/\s+/g, '');
      return row[key] || row[header] || '';
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
  uploadFn?: ExportHandlers['uploadFile'],
): Promise<string> => {
  if (!uploadFn) {
    throw new Error('uploadFile function is required in export config');
  }

  const mimetype =
    fileFormat === 'csv'
      ? 'text/csv'
      : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

  return await uploadFn(subdomain, filePath, fileName, mimetype);
};

export const createExportBatchProcessor = (
  config: ExportHandlers,
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

      const headerLabels = exportHeaders.map(
        (h: { label: string; key: string }) => h.label,
      );
      const headerKeys = exportHeaders.map(
        (h: { label: string; key: string }) => h.key,
      );

      let totalRows = 0;
      let processedRows = 0;
      let fileIndex = 0;
      let currentFileRows: Record<string, any>[] = [];
      const fileKeys: string[] = [];

      let skip = 0;
      let hasMoreData = true;

      while (hasMoreData) {
        const batch = await config.getExportData(
          {
            subdomain,
            data: {
              moduleName,
              collectionName,
              skip,
              limit: BATCH_SIZE,
            },
          },
          context,
        );

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

        currentFileRows.push(...mappedRows);
        totalRows += batch.length;
        processedRows += batch.length;
        skip += batch.length;

        if (currentFileRows.length >= ROWS_PER_FILE || !hasMoreData) {
          const tempFileName = `export-${exportId}-${fileIndex}.${fileFormat}`;
          const tempFilePath = path.join(os.tmpdir(), tempFileName);

          try {
            if (fileFormat === 'csv') {
              await writeCSVFile(tempFilePath, headerLabels, currentFileRows);
            } else {
              await writeXLSXFile(tempFilePath, headerLabels, currentFileRows);
            }

            const fileKey = await uploadExportFile(
              subdomain,
              tempFilePath,
              tempFileName,
              fileFormat,
              config.uploadFile,
            );

            fileKeys.push(fileKey);

            const baseFileName = exportDoc.fileName || `export-${exportId}`;
            const fileName =
              fileIndex === 0
                ? `${baseFileName}.${fileFormat}`
                : `${baseFileName}-${fileIndex + 1}.${fileFormat}`;

            await coreClient.saveExportFile(subdomain, {
              exportId,
              fileKey,
              fileName,
              fileIndex,
            });

            await coreClient.updateExportProgress(subdomain, exportId, {
              processedRows,
              totalRows,
            });

            fileIndex++;
            currentFileRows = [];
          } finally {
            await fs.promises
              .unlink(tempFilePath)
              .catch(() => Promise.resolve(undefined));
          }
        }

        if (batch.length < BATCH_SIZE) {
          hasMoreData = false;
        }
      }

      if (currentFileRows.length > 0) {
        const tempFileName = `export-${exportId}-${fileIndex}.${fileFormat}`;
        const tempFilePath = path.join(os.tmpdir(), tempFileName);

        try {
          if (fileFormat === 'csv') {
            await writeCSVFile(tempFilePath, headerLabels, currentFileRows);
          } else {
            await writeXLSXFile(tempFilePath, headerLabels, currentFileRows);
          }

          const fileKey = await uploadExportFile(
            subdomain,
            tempFilePath,
            tempFileName,
            fileFormat,
            config.uploadFile,
          );

          fileKeys.push(fileKey);

          const baseFileName = exportDoc.fileName || `export-${exportId}`;
          const fileName =
            fileIndex === 0
              ? `${baseFileName}.${fileFormat}`
              : `${baseFileName}-${fileIndex + 1}.${fileFormat}`;

          await coreClient.saveExportFile(subdomain, {
            exportId,
            fileKey,
            fileName,
            fileIndex,
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
        totalRows,
      });

      return { success: true, fileKeys };
    } catch (error: any) {
      await coreClient.updateExportProgress(subdomain, exportId, {
        status: 'failed',
        errorMessage: error?.message || 'Export worker failed',
      });
      throw error;
    }
  };
};
