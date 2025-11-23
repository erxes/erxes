import { z } from 'zod';
import {
  TGetImportHeadersOutput,
  InsertImportRowsInputData,
} from './zodSchemas';

export enum TImportExportProducers {
  INSERT_IMPORT_ROWS = 'insertImportRows',
  GET_IMPORT_HEADERS = 'getImportHeaders',
}

export interface IImportExportContext {
  subdomain: string;
  processId: string;
  models?: any;
}

export interface ImportExportProducers {
  insertImportRows?: (
    args: z.infer<typeof InsertImportRowsInputData>,

    ctx: IImportExportContext,
  ) => Promise<{
    successRows: any[];
    errorRows: any[];
  }>;
  getImportHeaders?: (
    args: {
      subdomain: string;
      data: { moduleName: string; collectionName: string };
    },
    ctx: IImportExportContext,
  ) => Promise<TGetImportHeadersOutput>;
}

export interface ImportExportConfigs extends ImportExportProducers {}
