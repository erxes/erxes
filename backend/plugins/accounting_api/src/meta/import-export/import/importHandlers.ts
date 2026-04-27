import {
  TBatchSkipRowInput,
  TCoreModuleProducerContext,
  TGetImportHeadersOutput,
  TInsertImportRowsInput,
} from 'erxes-api-shared/core-modules';
import { IModels } from '~/connectionResolvers';
import { processAccountCategoryRows } from './processAccountCategoryRows';
import { processAccountRows } from './processAccountRows';
import { processTransactionRows } from './processAccountTransactions';

const accountImportMap = {
  accountCategories: {
    headers: [
      { label: 'Code', key: 'code' },
      { label: 'Name', key: 'name' },
      { label: 'Parent ID', key: 'parentId' },
      { label: 'Description', key: 'description' },
      { label: 'Status', key: 'status' },
    ],
    processRows: (subdomain: string, models: IModels, rows: any[]) =>
      processAccountCategoryRows(subdomain, models, rows),
  },
  accounts: {
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
    headers: [
      { label: '**Date', key: 'date' },
      { label: '**Number', key: 'number' },
      { label: '*Journal', key: 'journal' },
      { label: '*Description', key: 'description' },
      { label: '*Status', key: 'status' },
      { label: '*Customer Type', key: 'customerType' },
      { label: '*Customer Info /phone, email, code/', key: 'customerInfo' },
      { label: '*Assigned User Emails', key: 'assignedUserEmails' },
      { label: '*Side', key: 'side' },
      { label: '*Condition Field 1', key: 'follow1' },
      { label: '*Condition Field 2', key: 'follow2' },
      { label: '*Condition Field 3', key: 'follow3' },

      { label: '*HasVat', key: 'hasVat' },
      { label: '*VatRowId', key: 'vatRowId' },
      { label: '*AfterVat', key: 'afterVat' },
      { label: '*AfterVatAccountId', key: 'afterVatAccountId' },
      { label: '*IsHandleVat', key: 'isHandleVat' },
      { label: '*VatAmount', key: 'vatAmount' },
      { label: '*HasCtax', key: 'hasCtax' },
      { label: '*CtaxRowId', key: 'ctaxRowId' },
      { label: '*IsHandleCtax', key: 'isHandleCtax' },
      { label: '*CtaxAmount', key: 'ctaxAmount' },

      { label: 'Account Code', key: 'accountCode' },
      { label: 'Branch Code', key: 'branchId' },
      { label: 'Department Code', key: 'departmentId' },
      { label: 'Amount', key: 'amount' },
      { label: 'Currency', key: 'currency' },
      { label: 'CurrencyAmount', key: 'currencyAmount' },
      { label: 'CustomRate', key: 'customRate' },
      { label: 'Assign User Email', key: 'assignUserEmail' },
      { label: 'Product Code', key: 'productCode' },
      { label: 'Count', key: 'count' },
      { label: 'UnitPrice', key: 'unitPrice' },
      { label: 'ExcludeVat', key: 'excludeVat' },
      { label: 'ExcludeCtax', key: 'excludeCtax' },
    ],
    processRows: (subdomain: string, models: IModels, rows: any[], userId: string) =>
      processTransactionRows(subdomain, models, rows, userId),
    batchSkipRow: (_subdomain: string, _models: IModels, rowData: any) => {
      return !rowData?.date;
    },
  },
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
    { collectionName, rows, userId }: TInsertImportRowsInput,
    { models, subdomain }: TCoreModuleProducerContext<IModels>,
  ) => {
    const handler = accountImportMap[collectionName];
    if (!handler)
      throw new Error(`Import handler not found for ${collectionName}`);
    return handler.processRows(subdomain, models, rows, userId);
  },
  batchSkipRow: async (
    { collectionName, rowData }: TBatchSkipRowInput,
    { models, subdomain }: TCoreModuleProducerContext<IModels>,
  ) => {
    const handler = accountImportMap[collectionName];
    if (!handler?.batchSkipRow)
      return false;
    return handler.batchSkipRow(subdomain, models, rowData);
  },
};
