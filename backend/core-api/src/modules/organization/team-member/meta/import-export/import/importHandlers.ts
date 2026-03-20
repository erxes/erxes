import {
  TCoreModuleProducerContext,
  TInsertImportRowsInput,
  TGetImportHeadersOutput,
} from 'erxes-api-shared/core-modules';
import { IModels } from '~/connectionResolvers';
import { processUserRows } from './processUserRows';

const userImportMap = {
  user: {
    headers: [
      { label: 'Username', key: 'username' },
      { label: 'Email', key: 'email' },
      { label: 'Employee ID', key: 'employeeId' },
      { label: 'Is Active', key: 'isActive' },

      { label: 'First Name', key: 'firstName' },
      { label: 'Middle Name', key: 'middleName' },
      { label: 'Last Name', key: 'lastName' },
      { label: 'Short Name', key: 'shortName' },
      { label: 'Full Name', key: 'fullName' },
      { label: 'Birth Date', key: 'birthDate' },
      { label: 'Work Started Date', key: 'workStartedDate' },
      { label: 'Location', key: 'location' },
      { label: 'Description', key: 'description' },
      { label: 'Operator Phone', key: 'operatorPhone' },

      { label: 'Brands', key: 'brands' },
      { label: 'Departments', key: 'departments' },
      { label: 'Branches', key: 'branches' },
    ],
    processRows: (models: IModels, rows: any[]) => processUserRows(models, rows),
  },
};

export const userImportHandlers = {
  getImportHeaders: async (
    { collectionName }: { collectionName: string },
    _ctx: TCoreModuleProducerContext<IModels>,
  ): Promise<TGetImportHeadersOutput> => {
    const handler = (userImportMap as any)[collectionName];
    if (!handler) throw new Error(`Import headers handler not found for ${collectionName}`);
    return handler.headers;
  },

  insertImportRows: async (
    { collectionName, rows }: TInsertImportRowsInput,
    { models }: TCoreModuleProducerContext<IModels>,
  ) => {
    const handler = (userImportMap as any)[collectionName];
    if (!handler) throw new Error(`Import handler not found for ${collectionName}`);
    if (!models) throw new Error('Models not available in context');
    return handler.processRows(models, rows);
  },
};
