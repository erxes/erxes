import {
  TCoreModuleProducerContext,
  TGetImportHeadersOutput,
  TInsertImportRowsInput,
} from 'erxes-api-shared/core-modules';
import { IModels } from '~/connectionResolvers';
import { processCustomerRows } from './import/customers/processCustomerRows';
import { processCompanyRows } from './import/companies/processCompanyRows';

const contactImportExportMap = {
  customer: {
    headers: [
      { label: 'First Name', key: 'firstName' },
      { label: 'Last Name', key: 'lastName' },
      { label: 'Email', key: 'primaryEmail' },
      { label: 'Phone', key: 'primaryPhone' },
      { label: 'Tags', key: 'tags' },
      { label: 'Sex', key: 'sex' },
    ],
    processRows: processCustomerRows,
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
    return contactImportExportMap[collectionName].headers;
  },
  insertImportRows: async (
    { collectionName, rows }: TInsertImportRowsInput,
    { models }: TCoreModuleProducerContext<IModels>,
  ) => await contactImportExportMap[collectionName].processRows(models, rows),
};
