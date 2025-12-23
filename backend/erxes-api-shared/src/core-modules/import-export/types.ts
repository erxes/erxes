import { z } from 'zod';

export interface IImportExportContext<TModels = any> {
  subdomain: string;
  processId: string;
  models?: TModels;
  [key: string]: any;
}

export interface ImportHeaderDefinition {
  label: string;
  key: string;
  isDefault?: boolean;
  type?: 'system' | 'customProperty';
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

export interface TImportHandlers {
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
export type GetExportData = {
  moduleName: string;
  collectionName: string;
  cursor?: string;
  limit: number;
  filters?: Record<string, any>;
  ids?: string[];
  selectedFields?: string[];
};
export interface GetExportDataArgs {
  subdomain: string;
  data: GetExportData;
}

export interface TExportHandlers {
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
  whenReady?: () => void;
}

export interface ImportExportConfigs {
  createContext?: (
    subdomain: string,
    context: IImportExportContext,
  ) => Promise<IImportExportContext>;
  import?: TImportHandlers;
  export?: TExportHandlers;
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
