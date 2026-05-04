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
      { label: '**Огноо', key: 'date' },
      { label: '**Баримт№', key: 'number' },
      { label: '*Журнал', key: 'journal' },
      { label: '*Гүйлгээний утга', key: 'description' },
      { label: '*Төлөв', key: 'status' },
      { label: '*Харилцагч төрөл (company, user, ?)', key: 'customerType' },
      { label: '*Харилцагч мэдээлэл/phone, email, code/', key: 'customerInfo' },
      { label: '*Холбогдох ажилтны мэйл', key: 'assignedUserEmails' },
      { label: '*ДТ|КТ', key: 'side' },
      { label: '*Нөхцөлт талбар 1', key: 'follow1' },
      { label: '*Нөхцөлт талбар 2', key: 'follow2' },
      { label: '*Нөхцөлт талбар 3', key: 'follow3' },

      { label: '*НӨАТ эсэх', key: 'hasVat' },
      { label: '*НӨАТ үзүүлэлт', key: 'vatRowId' },
      { label: '*Дараа НӨАТ эсэх', key: 'afterVat' },
      { label: '*ДАРАА НӨАТ данс', key: 'afterVatAccountId' },
      { label: '*НӨАТ дүн гараас', key: 'isHandleVat' },
      { label: '*НӨАТ дүн', key: 'vatAmount' },
      { label: '*НХАТ эсэх', key: 'hasCtax' },
      { label: '*НХАТ үзүүлэлт', key: 'ctaxRowId' },
      { label: '*НХАТ гараас', key: 'isHandleCtax' },
      { label: '*НХАТ дүн', key: 'ctaxAmount' },

      { label: 'Дансны дугаар', key: 'accountCode' },
      { label: 'Салбар код', key: 'branchId' },
      { label: 'Хэлтэс код', key: 'departmentId' },
      { label: 'Дүн', key: 'amount' },
      { label: 'Валют', key: 'currency' },
      { label: 'Валют дүн', key: 'currencyAmount' },
      { label: 'Тохиролцоо ханш', key: 'customRate' },
      { label: 'Холбогдох ажилтан', key: 'assignUserEmail' },
      { label: 'Бараа код', key: 'productCode' },
      { label: 'Тоо', key: 'count' },
      { label: 'Нэгж үнэ', key: 'unitPrice' },
      { label: 'НӨАТ орхих', key: 'excludeVat' },
      { label: 'НХАТ орхих', key: 'excludeCtax' },
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
