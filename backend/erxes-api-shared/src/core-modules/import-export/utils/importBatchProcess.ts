import { splitType } from '../../../core-modules/automations';
import {
  IImportExportContext,
  ImportExportConfigs,
  ImportExportHandlers,
  ImportJobData,
} from '../types';
import { CoreImportClient } from './createCoreImportClient';
import { Job } from 'bullmq';
import { nanoid } from 'nanoid';
import { readFileFromStorage } from '../../../utils/file/read';
import { processCSVFile, processXLSXFile } from './importUtils';

const createContext = async (
  subdomain: string,
  baseContext: IImportExportContext,
  config: ImportExportHandlers,
): Promise<IImportExportContext> => {
  // if (config.createContext) {
  //   return await config.createContext(subdomain, baseContext);
  // }

  return baseContext;
};
export const createImportBatchProcessor = (
  config: ImportExportHandlers,
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

    try {
      await coreClient.updateImportProgress(subdomain, importId, {
        status: 'validating',
      });

      const importDoc = await coreClient.getImport(subdomain, importId);
      if (!importDoc) {
        throw new Error('Import not found');
      }

      const fileName = importDoc.fileName || fileKey;
      const isCSV = fileName.toLowerCase().endsWith('.csv');

      const fileBuffer = await readFileFromStorage({ subdomain, key: fileKey });
      if (!fileBuffer) {
        throw new Error('File not found');
      }

      let totalRows = 0;
      const batchSize = 5000;
      let batch: any[] = [];
      let processedRows = 0;
      let successRows = 0;
      let errorRows = 0;
      const importedIds: string[] = [];
      const allErrorRows: any[] = [];

      await coreClient.updateImportProgress(subdomain, importId, {
        status: 'processing',
      });

      const importHeaders = await config.getImportHeaders(
        {
          subdomain,
          data: {
            moduleName,
            collectionName,
          },
        },
        context,
      );

      const rowIterator = isCSV
        ? processCSVFile(fileBuffer)
        : processXLSXFile(fileBuffer);

      let rowIndex = 0;
      let headerRow: string[] = [];
      const columnToKeyMap: Record<number, string> = {};
      const keyToHeaderMap: Record<string, string> = {};

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

        totalRows++;
        rowIndex++;

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
          const result = await config.insertImportRows(
            {
              subdomain,
              data: {
                moduleName,
                collectionName,
                rows: batch,
              },
            },
            context,
          );

          const successIds =
            result.successRows
              ?.map((r: any) => r._id || r.id)
              .filter(Boolean) || [];

          successRows += successIds.length;
          errorRows += result.errorRows.length;
          importedIds.push(...successIds);
          allErrorRows.push(...result.errorRows);
          processedRows += batch.length;

          await coreClient.updateImportProgress(subdomain, importId, {
            processedRows,
            successRows,
            errorRows,
            totalRows,
          });

          if (successIds.length) {
            await coreClient.addImportedIds(subdomain, importId, successIds);
          }

          batch = [];
        }
      }

      if (batch.length > 0) {
        const result = await config.insertImportRows(
          {
            subdomain,
            data: {
              moduleName,
              collectionName,
              rows: batch,
            },
          },
          context,
        );

        const successIds =
          result.successRows?.map((r: any) => r._id || r.id).filter(Boolean) ||
          [];

        successRows += successIds.length;
        errorRows += result.errorRows.length;
        importedIds.push(...successIds);
        allErrorRows.push(...result.errorRows);
        processedRows += batch.length;

        await coreClient.updateImportProgress(subdomain, importId, {
          processedRows,
          successRows,
          errorRows,
          totalRows,
        });

        if (successIds.length) {
          await coreClient.addImportedIds(subdomain, importId, successIds);
        }
      }

      let errorFileUrl: string | null = null;
      if (allErrorRows.length > 0) {
        errorFileUrl = await coreClient.saveErrorFile(subdomain, {
          importId,
          headerRow,
          errorRows: allErrorRows,
          keyToHeaderMap,
        });
      }

      await coreClient.updateImportProgress(subdomain, importId, {
        status: 'completed',
        processedRows,
        successRows,
        errorRows,
        totalRows,
        ...(errorFileUrl && { errorFileUrl }),
      });

      return { success: true, importedIds };
    } catch (error: any) {
      await coreClient.updateImportProgress(subdomain, importId, {
        status: 'failed',
        errorMessage: error?.message || 'Import worker failed',
      });
      throw error;
    }
  };
};
