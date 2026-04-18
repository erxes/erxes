import {
  TBatchSkipRowInput,
  TCoreModuleProducerContext,
  TGetImportHeadersOutput,
  TInsertImportRowsInput,
} from 'erxes-api-shared/core-modules';
import { processAccountRows } from './processAccountRows';
import { IModels } from '~/connectionResolvers';

const accountImportMap = {
  accountCategory: {

  },
  account: {
    headers: [
      { label: 'Code', key: 'code' },
      { label: 'Name', key: 'name' },
      { label: 'Category ID', key: 'categoryId' },
      { label: 'Parent ID', key: 'parentId' },
      { label: 'Currency', key: 'currency' },
      { label: 'Kind', key: 'kind' },
      { label: 'Journal', key: 'journal' },
      { label: 'Description', key: 'description' },
      { label: 'Branch ID', key: 'branchId' },
      { label: 'Department ID', key: 'departmentId' },
      { label: 'Status', key: 'status' },
      { label: 'Is Temp', key: 'isTemp' },
      { label: 'Is Out Balance', key: 'isOutBalance' },
    ],
    processRows: (subdomain: string, models: IModels, rows: any[]) =>
      processAccountRows(subdomain, models, rows),
  },
  transactions: {
    processRows: (subdomain: string, models: IModels, rows: any[]) =>
      processAccountRows(subdomain, models, rows),
    batchSkipRow: (_subdomain: string, _models: IModels, rowData: any) =>
      !rowData?.date,
  }
};
export const accountImportHandlers = {
  getImportHeaders: async (
    { collectionName }: { collectionName: string },
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    { subdomain }: TCoreModuleProducerContext<IModels>,
  ): Promise<TGetImportHeadersOutput> => {
    const handler = accountImportMap[collectionName];
    if (!handler)
      throw new Error(`Import headers handler not found for ${collectionName}`);
    return handler.headers;
  },
  insertImportRows: async (
    { collectionName, rows }: TInsertImportRowsInput,
    { models, subdomain }: TCoreModuleProducerContext<IModels>,
  ) => {
    const handler = accountImportMap[collectionName];
    if (!handler)
      throw new Error(`Import handler not found for ${collectionName}`);
    return handler.processRows(subdomain, models, rows);
  },
  batchSkipRow: async (
    { collectionName, rowData }: TBatchSkipRowInput,
    { models, subdomain }: TCoreModuleProducerContext<IModels>,
  ) => {
    const handler = accountImportMap[collectionName];
    if (!handler) throw new Error(`Import handler not found for ${collectionName}`);
    return handler.batchSkipRow(subdomain, models, rowData);
  },
};
