import { Job } from 'bullmq';
import { nanoid } from 'nanoid';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { splitType } from '../../../core-modules/automations';
import { readFileFromStorage } from '../../../utils/file/read';
import { IImportExportContext, TImportHandlers, ImportJobData } from '../types';
import { CoreImportClient } from './createCoreImportClient';
import { processCSVFile, processXLSXFile } from './importUtils';

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

    let errorFilePath: string | null = null;
    let errorFileInitialized = false;

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

      let fileBuffer = await readFileFromStorage({ subdomain, key: fileKey });
      if (!fileBuffer) {
        throw new Error('File not found');
      }

      let totalRows = 0;
      const batchSize = 5000;
      let batch: any[] = [];
      let processedRows = 0;
      let successRows = 0;
      let errorRows = 0;

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

      fileBuffer = null as any;

      let rowIndex = 0;
      let headerRow: string[] = [];
      const columnToKeyMap: Record<number, string> = {};
      const keyToHeaderMap: Record<string, string> = {};

      const escapeCsvField = (
        field: string | number | boolean | null | undefined,
      ): string => {
        const value =
          field === null || field === undefined
            ? ''
            : typeof field === 'string'
            ? field
            : String(field);

        if (
          value.includes('"') ||
          value.includes(',') ||
          value.includes('\n')
        ) {
          return `"${value.replace(/"/g, '""')}"`;
        }

        return value;
      };

      const getCsvHeaders = (): string[] => {
        return headerRow && headerRow.length > 0
          ? headerRow
          : Object.values(keyToHeaderMap);
      };

      const writeErrorRow = async (row: any) => {
        if (!errorFilePath) {
          errorFilePath = path.join(
            os.tmpdir(),
            `import-errors-${importId}-${nanoid()}.csv`,
          );
        }

        if (!errorFileInitialized) {
          const csvHeaders = getCsvHeaders();
          const finalHeaders = [...csvHeaders, 'Error'];
          await fs.promises.writeFile(
            errorFilePath,
            finalHeaders.map(escapeCsvField).join(',') + '\n',
            'utf8',
          );
          errorFileInitialized = true;
        }

        const csvHeaders = getCsvHeaders();
        const headerToKeyMap: Record<string, string> = {};
        Object.entries(keyToHeaderMap).forEach(([key, header]) => {
          headerToKeyMap[header] = key;
        });

        const dataValues = csvHeaders.map((header) => {
          const lookupKey = headerToKeyMap[header] || header;
          return escapeCsvField(row?.[lookupKey]);
        });

        const errorMessage =
          row?.error || row?.errorMessage || row?.message || 'Unknown error';

        dataValues.push(escapeCsvField(errorMessage));
        await fs.promises.appendFile(
          errorFilePath,
          dataValues.join(',') + '\n',
          'utf8',
        );
      };

      const parseCSVLine = (line: string): string[] => {
        const values: string[] = [];
        let currentValue = '';
        let insideQuotes = false;

        for (let i = 0; i < line.length; i++) {
          const char = line[i];
          const nextChar = line[i + 1];

          if (char === '"') {
            if (insideQuotes && nextChar === '"') {
              currentValue += '"';
              i++;
            } else {
              insideQuotes = !insideQuotes;
            }
          } else if (char === ',' && !insideQuotes) {
            values.push(currentValue);
            currentValue = '';
          } else {
            currentValue += char;
          }
        }

        values.push(currentValue);
        return values;
      };

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
          processedRows += batch.length;

          for (const errorRow of result.errorRows) {
            await writeErrorRow(errorRow);
          }

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
        processedRows += batch.length;

        for (const errorRow of result.errorRows) {
          await writeErrorRow(errorRow);
        }

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
      if (errorFilePath && errorFileInitialized) {
        const errorFileContent = await fs.promises.readFile(
          errorFilePath,
          'utf8',
        );
        const errorLines = errorFileContent.trim().split('\n');

        if (errorLines.length > 1) {
          const allErrorRows: any[] = [];
          const csvHeaders =
            headerRow && headerRow.length > 0
              ? headerRow
              : Object.values(keyToHeaderMap);
          const headerToKeyMap: Record<string, string> = {};
          Object.entries(keyToHeaderMap).forEach(([key, header]) => {
            headerToKeyMap[header] = key;
          });

          for (let i = 1; i < errorLines.length; i++) {
            const line = errorLines[i];
            const values = parseCSVLine(line);
            const errorMessage = values.pop() || 'Unknown error';
            const errorRow: any = { error: errorMessage };
            csvHeaders.forEach((header, idx) => {
              if (values[idx] !== undefined) {
                const key = headerToKeyMap[header] || header;
                errorRow[key] = values[idx];
              }
            });
            allErrorRows.push(errorRow);
          }

          errorFileUrl = await coreClient.saveErrorFile(subdomain, {
            importId,
            headerRow,
            errorRows: allErrorRows,
            keyToHeaderMap,
          });
        }

        try {
          if (errorFilePath) {
            await fs.promises.unlink(errorFilePath);
          }
        } catch {
          // Ignore cleanup errors
        }
      }

      await coreClient.updateImportProgress(subdomain, importId, {
        status: 'completed',
        processedRows,
        successRows,
        errorRows,
        totalRows,
        ...(errorFileUrl && { errorFileUrl }),
      });

      return { success: true };
    } catch (error: any) {
      if (errorFilePath) {
        try {
          await fs.promises.unlink(errorFilePath);
        } catch {
          // Ignore cleanup errors
        }
      }

      await coreClient.updateImportProgress(subdomain, importId, {
        status: 'failed',
        errorMessage: error?.message || 'Import worker failed',
      });
      throw error;
    }
  };
};
