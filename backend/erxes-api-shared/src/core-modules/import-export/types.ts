import { z } from 'zod';

export interface IImportExportContext {
  subdomain: string;
  processId: string;
  models?: any;
  [key: string]: any;
}

export interface ImportHeaderDefinition {
  label: string;
  key: string;
}

export interface InsertImportRowsInputData {
  moduleName: string;
  collectionName: string;
  rows: any[];
}

export interface InsertImportRowsArgs {
  subdomain: string;
  data: InsertImportRowsInputData;
}

export interface InsertImportRowsResult {
  successRows: any[];
  errorRows: Array<
    Record<string, any> & {
      error?: string;
    }
  >;
}

export interface ImportExportHandlers {
  insertImportRows: (
    args: InsertImportRowsArgs,
    ctx: IImportExportContext,
  ) => Promise<InsertImportRowsResult>;
  getImportHeaders: (
    args: {
      subdomain: string;
      data: { moduleName: string; collectionName: string };
    },
    ctx: IImportExportContext,
  ) => Promise<ImportHeaderDefinition[]>;

  whenReady?: () => void;
}

export interface GetExportDataArgs {
  subdomain: string;
  data: {
    moduleName: string;
    collectionName: string;
    skip: number;
    limit: number;
  };
}

export interface ExportHandlers {
  getExportHeaders: (
    args: {
      subdomain: string;
      data: { moduleName: string; collectionName: string };
    },
    ctx: IImportExportContext,
  ) => Promise<ImportHeaderDefinition[]>;
  getExportData: (
    args: GetExportDataArgs,
    ctx: IImportExportContext,
  ) => Promise<Record<string, any>[]>;
  uploadFile?: (
    subdomain: string,
    filePath: string,
    fileName: string,
    mimetype: string,
  ) => Promise<string>;
  whenReady?: () => void;
}

export interface ImportExportConfigs {
  createContext?: (
    subdomain: string,
    context: IImportExportContext,
  ) => Promise<IImportExportContext>;
  import: ImportExportHandlers;
  export?: ExportHandlers;
}

export interface ImportJobData {
  subdomain: string;
  data: {
    importId: string;
    entityType: string;
    fileKey: string;
  };
}

export interface ExportJobData {
  subdomain: string;
  data: {
    exportId: string;
    entityType: string;
    fileFormat: 'csv' | 'xlsx';
  };
}

export type TGetImportHeadersOutput = ImportHeaderDefinition[];
export type TInsertImportRowsInput = InsertImportRowsInputData;

export const InsertImportRowsInputSchema = z.object({
  subdomain: z.string(),
  data: z.object({
    moduleName: z.string(),
    collectionName: z.string(),
    rows: z.array(z.record(z.any())),
  }),
});

export enum TImportExportProducers {
  INSERT_IMPORT_ROWS = 'insertImportRows',
  GET_IMPORT_HEADERS = 'getImportHeaders',
  GET_EXPORT_HEADERS = 'getExportHeaders',
  GET_EXPORT_DATA = 'getExportData',
}
