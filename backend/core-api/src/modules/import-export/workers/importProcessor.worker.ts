import { Job } from 'bullmq';
import {
  createMQWorkerWithListeners,
  redis,
  sendCoreModuleProducer,
} from 'erxes-api-shared/utils';
import { generateModels } from '~/connectionResolvers';
import { readFileRequest } from '~/utils/file/read';
import {
  splitType,
  TImportExportProducers,
} from 'erxes-api-shared/core-modules';
import { ImportJobData } from './utils/types';
import { processCSVFile, processXLSXFile } from './utils/csvParser';
import { saveErrorFile } from './utils/errorFileHandler';
import { processBatch } from './utils/batchProcessor';

export const importProcessorWorker = async (job: Job<ImportJobData>) => {
  const { subdomain, data } = job.data;
  const { importId, entityType, fileKey } = data;

  const models = await generateModels(subdomain);
  const [pluginName, moduleName, collectionName] = splitType(entityType);

  try {
    await models.Imports.updateImportProgress(importId, {
      status: 'validating',
    });

    const importDoc = await models.Imports.getImport(importId);
    if (!importDoc) {
      throw new Error('Import not found');
    }

    const fileName = importDoc.fileName || fileKey;
    const isCSV = fileName.toLowerCase().endsWith('.csv');

    const fileBuffer = await readFileRequest({
      key: fileKey,
      models,
    });

    let totalRows = 0;
    const batchSize = 5000;
    let batch: any[] = [];
    let processedRows = 0;
    let successRows = 0;
    let errorRows = 0;
    const importedIds: string[] = [];
    const allErrorRows: any[] = [];

    await models.Imports.updateImportProgress(importId, {
      status: 'processing',
    });

    // Get import headers to map column indices to keys
    const importHeaders = await sendCoreModuleProducer({
      subdomain,
      pluginName,
      moduleName: 'importExport',
      method: 'query',
      producerName: TImportExportProducers.GET_IMPORT_HEADERS,
      input: {
        moduleName,
        collectionName,
      },
      defaultValue: [],
    });

    const rowIterator = isCSV
      ? processCSVFile(fileBuffer)
      : processXLSXFile(fileBuffer);

    let rowIndex = 0;
    let headerRow: string[] = [];
    const columnToKeyMap: Record<number, string> = {};
    const keyToHeaderMap: Record<string, string> = {};

    for await (const row of rowIterator) {
      if (rowIndex === 0) {
        // First row contains headers - create mapping from column index to key
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

      const rowData: any = {};
      row.forEach((value, index) => {
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
        const result = await processBatch({
          subdomain,
          pluginName,
          moduleName,
          collectionName,
          batch,
        });

        successRows += result.successIds.length;
        errorRows += result.errorRows.length;
        importedIds.push(...result.successIds);
        allErrorRows.push(...result.errorRows);
        processedRows += batch.length;

        await models.Imports.updateImportProgress(importId, {
          processedRows,
          successRows,
          errorRows,
          totalRows,
        });

        await models.Imports.addImportedIds(importId, result.successIds);

        batch = [];
      }
    }

    if (batch.length > 0) {
      const result = await processBatch({
        subdomain,
        pluginName,
        moduleName,
        collectionName,
        batch,
      });

      successRows += result.successIds.length;
      errorRows += result.errorRows.length;
      importedIds.push(...result.successIds);
      allErrorRows.push(...result.errorRows);
      processedRows += batch.length;

      await models.Imports.updateImportProgress(importId, {
        processedRows,
        successRows,
        errorRows,
        totalRows,
      });

      await models.Imports.addImportedIds(importId, result.successIds);
    }

    // Generate and save error file if there are errors
    let errorFileUrl: string | null = null;
    if (allErrorRows.length > 0) {
      errorFileUrl = await saveErrorFile(
        subdomain,
        headerRow,
        allErrorRows,
        keyToHeaderMap,
        models,
      );
    }

    await models.Imports.updateImportProgress(importId, {
      status: 'completed',
      processedRows,
      successRows,
      errorRows,
      totalRows,
      ...(errorFileUrl && { errorFileUrl }),
    } as any);

    return { success: true, importedIds };
  } catch (error) {
    await models.Imports.updateImportProgress(importId, {
      status: 'failed',
      errorMessage: error.message,
    });
    throw error;
  }
};

export const initImportWorkers = async () => {
  createMQWorkerWithListeners(
    'core',
    'import-processor',
    importProcessorWorker,
    redis,
    () => {
      // Import processor worker is ready
    },
  );
};
