import {
  TCoreModuleProducerContext,
  TGetImportHeadersOutput,
  TInsertImportRowsInput,
} from 'erxes-api-shared/core-modules';
import { IModels } from '~/connectionResolvers';
import { processDealRows } from './processDealRows';

const dealImportMap = {
  deal: {
    headers: [
      { label: 'Name', key: 'name' },
      { label: 'Description', key: 'description' },
      { label: 'Stage ID', key: 'stageId' },
      { label: 'Amount', key: 'totalAmount' },
      { label: 'Priority', key: 'priority' },
      { label: 'Status', key: 'status' },
      { label: 'Start Date', key: 'startDate' },
      { label: 'Close Date', key: 'closeDate' },
      { label: 'Assigned Users', key: 'assignedUserIds' },
      { label: 'Tags', key: 'tagIds' },
      { label: 'Labels', key: 'labelIds' },
      { label: 'Branches', key: 'branchIds' },
      { label: 'Departments', key: 'departmentIds' },
      { label: 'Number', key: 'number' },
    ],
    processRows: (models: IModels, rows: any[]) => processDealRows(models, rows),
  },
};

export const dealImportHandlers = {
  getImportHeaders: async (
    { collectionName }: { collectionName: string },
    _ctx: TCoreModuleProducerContext<IModels>,
  ): Promise<TGetImportHeadersOutput> => {
    const handler = dealImportMap[collectionName as keyof typeof dealImportMap];
    if (!handler)
      throw new Error(`Import headers not found for "${collectionName}"`);
    return handler.headers;
  },
  insertImportRows: async (
    { collectionName, rows }: TInsertImportRowsInput,
    { models }: TCoreModuleProducerContext<IModels>,
  ) => {
    const handler = dealImportMap[collectionName as keyof typeof dealImportMap];
    if (!handler)
      throw new Error(`Import handler not found for "${collectionName}"`);
    return handler.processRows(models, rows);
  },
};
