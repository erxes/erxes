import { z } from 'zod';
import { TImportExportProducers } from './types';

export const InsertImportRowsInput = z.object({
  moduleName: z.string(),
  collectionName: z.string(),
  rows: z.array(z.any()),
});

export const GetExportHeadersInput = z.object({
  moduleName: z.string(),
  collectionName: z.string(),
});

export type TGetExportHeadersInput = z.infer<typeof GetExportHeadersInput>;

export const GetExportDataInput = z.object({
  moduleName: z.string(),
  collectionName: z.string(),
  cursor: z.string().optional(),
  limit: z.number(),
  filters: z.record(z.any()).optional(),
  ids: z.array(z.string()).optional(),
});

export type TGetExportDataInput = z.infer<typeof GetExportDataInput>;
type TInsertImportRowsInput = z.infer<typeof InsertImportRowsInput>;

export const InsertImportRowsOutput = z.object({
  successRows: z.array(z.any()),
  errorRows: z.array(z.any()),
});

const GetImportHeadersInput = z.object({
  moduleName: z.string(),
  collectionName: z.string(),
});

export type TGetImportHeadersInput = z.infer<typeof GetImportHeadersInput>;

export const GetImportHeadersOutput = z.array(
  z.object({
    label: z.string(),
    key: z.string(),
  }),
);

export type TInsertImportRowsOutput = z.infer<typeof InsertImportRowsOutput>;

export type TImportExportProducersInput = {
  [TImportExportProducers.INSERT_IMPORT_ROWS]: TInsertImportRowsInput;
  [TImportExportProducers.GET_IMPORT_HEADERS]: TGetImportHeadersInput;
  [TImportExportProducers.GET_EXPORT_HEADERS]: TGetExportHeadersInput;
  [TImportExportProducers.GET_EXPORT_DATA]: TGetExportDataInput;
};
