import {
  TCoreModuleProducerContext,
  TGetImportHeadersOutput,
  TInsertImportRowsInput,
} from 'erxes-api-shared/core-modules';
import { IModels } from '~/connectionResolvers';
import { processUserRows } from './processUserRows';
import { getCustomPropertyHeaders } from '~/meta/import-export/utils';

const userImportMap = {
  users: {
    fileName: 'team-members-template.csv',
    headers: [
      { label: 'Username', key: 'username' },
      {
        label: 'Email',
        key: 'email',
        example: 'name@example.com',
      },
      { label: 'Employee ID', key: 'employeeId' },
      {
        label: 'Is Active',
        key: 'isActive',
        dataType: 'boolean' as const,
        example: 'true / false',
      },

      { label: 'First Name', key: 'firstName' },
      { label: 'Middle Name', key: 'middleName' },
      { label: 'Last Name', key: 'lastName' },
      { label: 'Short Name', key: 'shortName' },
      { label: 'Full Name', key: 'fullName' },
      {
        label: 'Birth Date',
        key: 'birthDate',
        dataType: 'date' as const,
        example: 'YYYY-MM-DD',
      },
      {
        label: 'Work Started Date',
        key: 'workStartedDate',
        dataType: 'date' as const,
        example: 'YYYY-MM-DD',
      },
      { label: 'Location', key: 'location' },
      { label: 'Description', key: 'description' },
      { label: 'Operator Phone', key: 'operatorPhone' },

      {
        label: 'Brands',
        key: 'brands',
        dataType: 'multiSelect' as const,
        example: 'Brand A, Brand B',
      },
      {
        label: 'Departments',
        key: 'departments',
        dataType: 'multiSelect' as const,
        example: 'Sales, Finance',
      },
      {
        label: 'Branches',
        key: 'branches',
        dataType: 'multiSelect' as const,
        example: 'Head Office, Branch 2',
      },
    ],
    propertiesType: 'core:user',
    processRows: (models: IModels, rows: any[]) =>
      processUserRows(models, rows),
  },
};

export const userImportHandlers = {
  getImportHeaders: async (
    { collectionName }: { collectionName: 'users' },
    { models }: TCoreModuleProducerContext<IModels>,
  ): Promise<TGetImportHeadersOutput> => {
    const handler = userImportMap[collectionName];
    if (!handler)
      throw new Error(`Import headers handler not found for ${collectionName}`);

    const { propertiesType, headers = [] } = handler;

    return [
      ...headers,
      ...(await getCustomPropertyHeaders(models, propertiesType)),
    ];
  },

  insertImportRows: async (
    { collectionName, rows }: TInsertImportRowsInput,
    { models }: TCoreModuleProducerContext<IModels>,
  ) => {
    const handler = userImportMap[collectionName];
    if (!handler)
      throw new Error(`Import handler not found for ${collectionName}`);
    if (!models) throw new Error('Models not available in context');
    return handler.processRows(models, rows);
  },
};
