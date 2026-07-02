import {
  TCoreModuleProducerContext,
  TGetImportHeadersOutput,
  TInsertImportRowsInput,
} from 'erxes-api-shared/core-modules';
import { sendTRPCMessage } from 'erxes-api-shared/utils';
import { IModels } from '~/connectionResolvers';
import { processDealRows } from './processDealRows';

const dealImportMap = {
  deals: {
    headers: [
      { label: 'Name', key: 'name' },
      { label: 'Stage ID', key: 'stageId' },
      { label: 'Board Name', key: 'boardName' },
      { label: 'Pipeline Name', key: 'pipelineName' },
      { label: 'Stage Name', key: 'stageName' },
      { label: 'Number', key: 'number' },
      { label: 'Description', key: 'description' },
      { label: 'Priority', key: 'priority' },
      { label: 'Start Date', key: 'startDate' },
      { label: 'Close Date', key: 'closeDate' },
      { label: 'Assigned User IDs', key: 'assignedUserIds' },
      { label: 'Assigned User Email', key: 'assignedUserEmail' },
      { label: 'Customer IDs', key: 'customerIds' },
      { label: 'Customers', key: 'customers' },
      { label: 'Company IDs', key: 'companyIds' },
      { label: 'Companies', key: 'companies' },
      { label: 'Label IDs', key: 'labelIds' },
      { label: 'Labels', key: 'labels' },
      { label: 'Tag IDs', key: 'tagIds' },
      { label: 'Branch IDs', key: 'branchIds' },
      { label: 'Department IDs', key: 'departmentIds' },
      { label: 'Products JSON', key: 'productsData' },
      { label: 'Custom Fields JSON', key: 'customFieldsData' },
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
  getImportHeaders: async (
    { collectionName }: TInsertImportRowsInput,
    { subdomain }: TCoreModuleProducerContext<IModels>,
  ): Promise<TGetImportHeadersOutput> => {
    const config = getCollectionConfig(collectionName);

    if (collectionName !== 'deals') {
      return config.headers;
    }

    const customFields = await sendTRPCMessage({
      subdomain,
      pluginName: 'core',
      method: 'query',
      module: 'fields',
      action: 'find',
      input: {
        query: { contentType: 'sales:deal' },
        projection: { _id: 1, text: 1 },
        sort: { order: 1 },
      },
    });

    if (customFields !== undefined && !Array.isArray(customFields)) {
      throw new Error('Custom field lookup returned an invalid response');
    }

    return [
      ...config.headers,
      ...(customFields || []).map((field: any) => ({
        label: field.text || field._id,
        key: `customFieldsData.${field._id}`,
        type: 'customProperty' as const,
      })),
    ];
  },

  insertImportRows: async (
    { collectionName, rows, userId }: TInsertImportRowsInput,
    { models, subdomain }: TCoreModuleProducerContext<IModels>,
  ) => {
    if (!userId) {
      throw new Error('Import userId is required');
    }

    if (!Array.isArray(rows)) {
      throw new Error('Import rows must be an array');
    }

    return getCollectionConfig(collectionName).processRows(
      models,
      subdomain,
      rows,
      userId,
    );
  },
};
