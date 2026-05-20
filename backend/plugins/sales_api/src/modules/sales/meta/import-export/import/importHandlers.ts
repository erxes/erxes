import {
  TCoreModuleProducerContext,
  TGetImportHeadersOutput,
  TInsertImportRowsInput,
} from 'erxes-api-shared/core-modules';
import { IModels } from '~/connectionResolvers';
import { processDealRows } from './processDealRows';

const dealImportMap = {
  deals: {
    headers: [
      { label: 'Name', key: 'name' },
      { label: 'Stage ID', key: 'stageId' },
      { label: 'Number', key: 'number' },
      { label: 'Description', key: 'description' },
      { label: 'Priority', key: 'priority' },
      { label: 'Start Date', key: 'startDate' },
      { label: 'Close Date', key: 'closeDate' },
      { label: 'Assigned User IDs', key: 'assignedUserIds' },
      { label: 'Customer IDs', key: 'customerIds' },
      { label: 'Company IDs', key: 'companyIds' },
      { label: 'Label IDs', key: 'labelIds' },
      { label: 'Tag IDs', key: 'tagIds' },
      { label: 'Branch IDs', key: 'branchIds' },
      { label: 'Department IDs', key: 'departmentIds' },
      { label: 'Products JSON', key: 'productsData' },
    ],
    processRows: (
      models: IModels,
      subdomain: string,
      rows: any[],
      userId: string,
    ) => processDealRows(models, subdomain, rows, userId),
  },
};

const getCollectionConfig = (collectionName?: string) => {
  const config = dealImportMap[collectionName as keyof typeof dealImportMap];

  if (!config) {
    throw new Error(`Import handler not found for "${collectionName}"`);
  }

  return config;
};

export const dealImportHandlers = {
  getImportHeaders: async ({
    collectionName,
  }: TInsertImportRowsInput): Promise<TGetImportHeadersOutput> => {
    return getCollectionConfig(collectionName).headers;
  },

  insertImportRows: async (
    { collectionName, rows, userId }: TInsertImportRowsInput,
    { models, subdomain }: TCoreModuleProducerContext<IModels>,
  ) => {
    if (!userId) {
      throw new Error('Import userId is required');
    }

    return getCollectionConfig(collectionName).processRows(
      models,
      subdomain,
      rows,
      userId,
    );
  },
};
