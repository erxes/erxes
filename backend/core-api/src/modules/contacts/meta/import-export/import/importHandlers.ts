import {
  TCoreModuleProducerContext,
  TGetImportHeadersOutput,
  TInsertImportRowsInput,
} from 'erxes-api-shared/core-modules';
import { IModels } from '~/connectionResolvers';
import { processCustomerRows } from './customers/processCustomerRows';
import { processCompanyRows } from './companies/processCompanyRows';

const contactImportMap = {
  customer: {
    headers: [
      { label: 'First Name', key: 'firstName' },
      { label: 'Last Name', key: 'lastName' },
      { label: 'Email', key: 'primaryEmail' },
      { label: 'Phone', key: 'primaryPhone' },
      { label: 'Tags', key: 'tags' },
      { label: 'Sex', key: 'sex' },
    ],
    processRows: (models: IModels, rows: any[]) =>
      processCustomerRows(models, rows, 'customer'),
  },
  lead: {
    headers: [
      { label: 'First Name', key: 'firstName' },
      { label: 'Last Name', key: 'lastName' },
      { label: 'Email', key: 'primaryEmail' },
      { label: 'Phone', key: 'primaryPhone' },
    ],
    processRows: (models: IModels, rows: any[]) =>
      processCustomerRows(models, rows, 'lead'),
  },
  company: {
    headers: [
      { label: 'Name', key: 'name' },
      { label: 'Email', key: 'primaryEmail' },
      { label: 'Phone', key: 'primaryPhone' },
    ],
    processRows: processCompanyRows,
  },
};

export const contactImportHandlers = {
  getImportHeaders: async (
    { collectionName }: { collectionName: string },
    { subdomain }: TCoreModuleProducerContext<IModels>,
  ): Promise<TGetImportHeadersOutput> => {
    return contactImportMap[collectionName].headers;
  },
  insertImportRows: async (
    { collectionName, rows }: TInsertImportRowsInput,
    { models }: TCoreModuleProducerContext<IModels>,
  ) => await contactImportMap[collectionName].processRows(models, rows),
};
